import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener, ChangeDetectorRef } from '@angular/core';
import CursorPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.cursor.min.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min.js';
import { SceneService } from '../services/scene.service';
import { ScenePlaybackRegion } from '../models/scene-playback-region';
import WaveSurfer from 'wavesurfer.js';
import { TimelineService } from '../services/timeline.service';
import { PresetService } from '../services/preset.service';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
export class TimelineComponent implements OnInit, AfterViewInit {

  @ViewChild('waveWrapper')
  waveWrapper: ElementRef;

  private selectedPlaybackRegion: ScenePlaybackRegion;
  public zoom = 0;
  private color = '253, 126, 20';
  private intensity = 0.4
  private intensityHighlighted = 0.8;
  public currentTime: string;
  public duration: string;
  private timeUpdateSubscription: Subscription;

  constructor(
    private sceneService: SceneService,
    private timelineService: TimelineService,
    private presetService: PresetService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.presetService.previewSelectionChanged.subscribe(() => {
      this.selectedPlaybackRegion = undefined;
      this.drawRegions();
    });
  }

  ngOnInit() {
  }

  private pad(num: number, size: number): string {
    if (!num) {
      num = 0;
    }

    let padded: string = num.toString();
    while (padded.length < size) {
      padded = '0' + padded;
    }

    return padded;
  }

  private msToTime(millis: number, includeMillis: boolean = true): string {
    let ms: number = Math.round(millis % 1000);
    let seconds: number = Math.floor(((millis % 360000) % 60000) / 1000);
    let minutes: number = Math.floor((millis % 3600000) / 60000);

    if (includeMillis) {
      return this.pad(minutes, 2) + ':' + this.pad(seconds, 2) + '.' + this.pad(ms, 3);
    } else {
      return this.pad(minutes, 2) + ':' + this.pad(seconds, 2);
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.timelineService.waveSurfer = WaveSurfer.create({
        container: '#waveform',
        waveColor: '#cecece',
        progressColor: 'white',
        //barWidth: 2,
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
      this.timelineService.waveSurfer.load('../../assets/test.mp3');

      this.timelineService.waveSurfer.on('ready', () => {
        setTimeout(() => {
          this.duration = this.msToTime(this.timelineService.waveSurfer.getDuration() * 1000);
          this.updateCurrentTime();
          this.changeDetectorRef.detectChanges();
          this.onResize();
          this.drawRegions();
        }, 0);
      });

      this.timelineService.waveSurfer.on('seek', () => {
        this.updateCurrentTime();
      });

      this.timelineService.waveSurfer.on('play', () => {
        this.startTimeUpdater();
      });

      this.timelineService.waveSurfer.on('pause', () => {
        this.stopTimeUpdater();
      });

      this.timelineService.waveSurfer.on('region-created', (region) => {
        // Region created by selection
        if (this.sceneService.selectedScenes && this.sceneService.selectedScenes.length == 1) {
          if (!region.data.handled) {
            this.addRegion(region);
          }
        } else {
          region.remove();
        }
      });

      this.timelineService.waveSurfer.on('region-updated', () => {
        this.changeDetectorRef.detectChanges();
      });
    }, 0);
  }

  private updateCurrentTime() {
    if (this.timelineService.waveSurfer) {
      this.currentTime = this.msToTime(this.timelineService.waveSurfer.getCurrentTime() * 1000);
    }
  }

  private startTimeUpdater() {
    if (this.timeUpdateSubscription) {
      this.timeUpdateSubscription.unsubscribe;
    }

    let timeUpdater = timer(0, 10);
    this.timeUpdateSubscription = timeUpdater.subscribe(() => {
      this.updateCurrentTime();
    });
  }

  private stopTimeUpdater() {
    if (this.timeUpdateSubscription) {
      this.timeUpdateSubscription.unsubscribe;
    }
  }

  @HostListener('window:resize', ['$event'])
  public onResize() {
    if (this.timelineService.waveSurfer) {
      this.timelineService.waveSurfer.setHeight(1);
      this.timelineService.waveSurfer.setHeight(this.waveWrapper.nativeElement.clientHeight);
    }
  }

  applyZoom(zoom: any) {
    this.zoom = zoom;
    if (this.timelineService.waveSurfer) {
      this.timelineService.waveSurfer.zoom(this.zoom);
    }
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

    if (!this.selectedPlaybackRegion || this.selectedPlaybackRegion != scenePlaybackRegion) {
      redraw = true;
    }

    if (scenePlaybackRegion) {
      this.selectedPlaybackRegion = scenePlaybackRegion;
    }

    if (redraw) {
      // Only highlight the correct region but do not redraw all regions,
      // because dragging & dropping would break initially otherwise.
      for (let key of Object.keys(this.timelineService.waveSurfer.regions.list)) {
        let region: any = this.timelineService.waveSurfer.regions.list[key];
        let intensity = this.intensity;

        if (this.selectedPlaybackRegion && this.selectedPlaybackRegion == region.scenePlaybackRegion) {
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

    if (!this.sceneService.selectedScenes || this.sceneService.selectedScenes.length > 1) {
      return;
    }

    for (let scene of this.sceneService.selectedScenes) {
      for (let scenePlaybackRegion of scene.scenePlaybackRegionList) {
        // add the playback region
        const waveSurferRegion = this.timelineService.waveSurfer.addRegion({
          start: scenePlaybackRegion.startMillis / 1000,
          end: scenePlaybackRegion.endMillis / 1000,
          color: 'rgba(0, 0, 0, 0)',
          data: { handled: true }
        });
        this.connectRegion(waveSurferRegion, scenePlaybackRegion);

        // add all presets
        for(let presetUuid of scene.presetUuids) {
          const preset = this.presetService.getPresetByUuid(presetUuid);

          let waveSurferRegion = this.timelineService.waveSurfer.addRegion({
            start: (scenePlaybackRegion.startMillis + (preset.startMillis ? preset.startMillis : 0)) / 1000,
            end: (scenePlaybackRegion.startMillis + (preset.endMillis ? preset.endMillis : scenePlaybackRegion.endMillis - scenePlaybackRegion.startMillis)) / 1000,
            color: 'rgba(0, 0, 0, 0)',
            data: { handled: true },
             // TODO
            attributes: { 
              preset: true,
              name: 'Preset 1'
            }
          });

          // TODO
        }
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

    if (!this.sceneService.selectedScenes || this.sceneService.selectedScenes.length != 1) {
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

    this.selectedPlaybackRegion = scenePlaybackRegion;

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
