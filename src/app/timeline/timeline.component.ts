import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import CursorPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.cursor.min.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min.js';
import { SceneService } from '../services/scene.service';
import { ScenePlaybackRegion } from '../models/scene-playback-region';
import WaveSurfer from 'wavesurfer.js';
import { TimelineService } from '../services/timeline.service';
import { PresetService } from '../services/preset.service';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
export class TimelineComponent implements OnInit, AfterViewInit {

  @ViewChild('waveWrapper')
  waveWrapper: ElementRef;

  highlightedPlaybackRegion: ScenePlaybackRegion;

  private color = '253, 126, 20';
  private intensity = 0.4
  private intensityHighlighted = 0.8;

  constructor(
    private sceneService: SceneService,
    private timelineService: TimelineService,
    private presetService: PresetService
    ) {
      this.presetService.previewSelectionChanged.subscribe(() => {
      this.highlightedPlaybackRegion = undefined;
      this.drawRegions();
    });
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.timelineService.waveSurfer = WaveSurfer.create({
        container: '#waveform',
        waveColor: '#cecece',
        progressColor: 'white',
        height: 1,
        plugins: [
          CursorPlugin.create({
            showTime: true,
            opacity: 1,
            color: 'white',
            customShowTimeStyle: {
              'background-color': '#fff',
              color: 'black',
              padding: '2px',
              'font-size': '10px'
            }
          }),
          RegionsPlugin.create({
            dragSelection: {
              slop: 5
            },
            color: 'rgba(' + this.color + ', ' + this.intensityHighlighted + ')'
          })
        ]
      });
      this.timelineService.waveSurfer.setHeight(this.waveWrapper.nativeElement.clientHeight);
      this.timelineService.waveSurfer.load('../../assets/test.mp3');

      this.timelineService.waveSurfer.on('ready', () => {
        setTimeout(() => {
          this.drawRegions();
        }, 0);
      });

      this.timelineService.waveSurfer.on('region-created', (region) => {
        // Region created by selection
        if(this.sceneService.selectedScenes && this.sceneService.selectedScenes.length == 1) {
          if (!region.data.handled) {
            this.addRegion(region);
          }
        } else {
          region.remove();
        }
      });
    }, 0);

    //wavesurfer.zoom(130);
  }

  private isWaveSurferReady(): boolean {
    if (!this.timelineService.waveSurfer) {
      return false;
    }

    if (!this.timelineService.waveSurfer.isReady) {
      return false;
    }

    return true;
  }

  private updateHighlightedRegion(scenePlaybackRegion?: ScenePlaybackRegion) {
    let redraw = false;

    if (!this.highlightedPlaybackRegion || this.highlightedPlaybackRegion != scenePlaybackRegion) {
      redraw = true;
    }

    if (scenePlaybackRegion) {
      this.highlightedPlaybackRegion = scenePlaybackRegion;
    }

    if (redraw) {
      // Only highlight the correct region but do not redraw all regions,
      // because dragging & dropping would break initially otherwise.
      for (let key of Object.keys(this.timelineService.waveSurfer.regions.list)) {
        let region: any = this.timelineService.waveSurfer.regions.list[key];
        let intensity = this.intensity;

        if (this.highlightedPlaybackRegion && this.highlightedPlaybackRegion == region.scenePlaybackRegion) {
          intensity = this.intensityHighlighted;
        }

        region.color = 'rgba(' + this.color + ', ' + intensity + ')';
        region.updateRender();
      }
    }
  }

  private connectRegion(waveSurferRegion: any, scenePlaybackRegion: ScenePlaybackRegion) {
    waveSurferRegion.scenePlaybackRegion = scenePlaybackRegion;

    waveSurferRegion.on('click', () => {
      this.updateHighlightedRegion(scenePlaybackRegion);
    });

    waveSurferRegion.on('update', () => {
      this.updateHighlightedRegion(scenePlaybackRegion);
      scenePlaybackRegion.startMillis = waveSurferRegion.start * 1000;
      scenePlaybackRegion.endMillis = waveSurferRegion.end * 1000;
    });
  }

  private drawRegions() {
    // Draw the regions of the currently selected scene
    if (!this.isWaveSurferReady()) {
      return;
    }

    this.timelineService.waveSurfer.clearRegions();

    if(!this.sceneService.selectedScenes || this.sceneService.selectedScenes.length > 1) {
      return;
    }

    for (let scene of this.sceneService.selectedScenes) {
      for (let scenePlaybackRegion of scene.scenePlaybackRegionList) {
        let waveSurferRegion = this.timelineService.waveSurfer.addRegion({
          start: scenePlaybackRegion.startMillis / 1000, // time in seconds
          end: scenePlaybackRegion.endMillis / 1000, // time in seconds
          color: 'rgba(0, 0, 0, 0)',
          data: { handled: true },
          attributes: { preset: true, name: 'Preset 1' } // TODO
        });

        this.connectRegion(waveSurferRegion, scenePlaybackRegion);
      }
    }

    this.updateHighlightedRegion();
  }

  play() {
    this.timelineService.playState = 'playing';
    this.timelineService.waveSurfer.play();
  }

  pause() {
    this.timelineService.playState = 'paused';
    this.timelineService.waveSurfer.pause();
  }

  rewind() {
    this.timelineService.playState = 'paused';
    this.pause();
    this.timelineService.waveSurfer.seekTo(0);
  }

  addRegion(waveSurferRegion?: any) {
    if (!this.isWaveSurferReady()) {
      return;
    }

    if(!this.sceneService.selectedScenes || this.sceneService.selectedScenes.length != 1) {
      return;
    }

    let scenePlaybackRegion: ScenePlaybackRegion = new ScenePlaybackRegion();

    if (waveSurferRegion) {
      scenePlaybackRegion.startMillis = waveSurferRegion.start * 1000;
      scenePlaybackRegion.endMillis = waveSurferRegion.end * 1000;
    } else {
      scenePlaybackRegion.startMillis = this.timelineService.waveSurfer.getDuration() * 1000 / 3;
      scenePlaybackRegion.endMillis = this.timelineService.waveSurfer.getDuration() * 1000 / 3 * 2;
    }

    this.sceneService.selectedScenes[0].scenePlaybackRegionList.push(scenePlaybackRegion);

    this.highlightedPlaybackRegion = scenePlaybackRegion;

    if (waveSurferRegion) {
      this.connectRegion(waveSurferRegion, scenePlaybackRegion);
      this.updateHighlightedRegion();
    } else {
      this.drawRegions();
    }
  }

  removeRegion() {

  }

}
