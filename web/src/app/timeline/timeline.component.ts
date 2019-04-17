import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener, ChangeDetectorRef } from '@angular/core';
import CursorPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.cursor.min.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min.js';
import TimeLinePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.timeline.min.js';
import { SceneService } from '../services/scene.service';
import { ScenePlaybackRegion } from '../models/scene-playback-region';
import WaveSurfer from 'wavesurfer.js';
import { TimelineService } from '../services/timeline.service';
import { PresetService } from '../services/preset.service';
import { Subscription, timer } from 'rxjs';
import { Scene } from '../models/scene';
import { Preset } from '../models/preset';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css'],
})
export class TimelineComponent implements OnInit, AfterViewInit {

  @ViewChild('waveWrapper')
  waveWrapper: ElementRef;

  private selectedPlaybackRegion: ScenePlaybackRegion;
  public zoom = 0;
  private intensity = 0.2;
  private intensitySelectedScene = 0.4;
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
      this.updateRegionSelection();
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
            color: '#fff'
          }),
          TimeLinePlugin.create({
            container: "#waveform-timeline",
            primaryFontColor: '#fff',
            secondaryFontColor: '#fff'
          })
        ]
      });
      this.timelineService.waveSurfer.load('../../assets/test.wav');

      this.timelineService.waveSurfer.on('ready', () => {
        setTimeout(() => {
          this.duration = this.msToTime(this.timelineService.waveSurfer.getDuration() * 1000);
          this.updateCurrentTime();
          this.changeDetectorRef.detectChanges();
          this.onResize();
          this.drawAllRegions();
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
      setTimeout(() => {
        this.timelineService.waveSurfer.zoom(this.zoom);
      }, 0);
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

  private hexToRgb(hex: string) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  private updateRegionSelection() {
    if (!this.timelineService.waveSurfer) {
      return;
    }

    for (let key of Object.keys(this.timelineService.waveSurfer.regions.list)) {
      let region: any = this.timelineService.waveSurfer.regions.list[key];
      let intensity = this.intensity;

      region.drag = false;
      region.resize = false;
      region.attributes.selectable = false;

      if (this.sceneService.sceneIsSelected(region.scene)) {
        intensity = this.intensitySelectedScene;
        region.drag = true;
        region.resize = true;
        region.attributes.selectable = true;
      }

      region.attributes.selected = false;

      if (this.selectedPlaybackRegion && this.selectedPlaybackRegion == region.scenePlaybackRegion) {
        intensity = this.intensityHighlighted;
        region.attributes.selected = true;
      }

      region.color = 'rgba(' + this.hexToRgb(region.scene.color).r + ', ' + this.hexToRgb(region.scene.color).g + ', ' + this.hexToRgb(region.scene.color).b + ', ' + intensity + ')';
      region.updateRender();
    }
  }

  private setSelectedRegion(scenePlaybackRegion?: ScenePlaybackRegion) {
    if (this.selectedPlaybackRegion && this.selectedPlaybackRegion == scenePlaybackRegion) {
      // No update required
      return;
    }

    if (scenePlaybackRegion) {
      this.selectedPlaybackRegion = scenePlaybackRegion;
    }

    this.updateRegionSelection();
  }

  private connectRegion(waveSurferRegion: any, scene: Scene, scenePlaybackRegion: ScenePlaybackRegion, preset?: Preset) {
    waveSurferRegion.scenePlaybackRegion = scenePlaybackRegion;
    waveSurferRegion.scene = scene;
    waveSurferRegion.preset = preset;

    waveSurferRegion.on('click', () => {
      if(this.sceneService.sceneIsSelected(scene)) {
        this.setSelectedRegion(scenePlaybackRegion);
      }
    });

    waveSurferRegion.on('update', (x) => {
      this.setSelectedRegion(scenePlaybackRegion);
      scenePlaybackRegion.startMillis = waveSurferRegion.start * 1000;
      scenePlaybackRegion.endMillis = waveSurferRegion.end * 1000;
    });

    waveSurferRegion.on('update-end', () => {
      // TODO snap to grid
      waveSurferRegion.start = waveSurferRegion.start - 10;
      waveSurferRegion.updateRender();
    });
  }

  private drawRegion(scenePlaybackRegion: ScenePlaybackRegion, scene: Scene) {
    // draw the regions of the currently selected scene
    if (!this.isWaveSurferReady()) {
      return;
    }

    if (!this.sceneService.selectedScenes || this.sceneService.selectedScenes.length > 1) {
      return;
    }

    // add the playback region
    const waveSurferRegion = this.timelineService.waveSurfer.addRegion({
      start: scenePlaybackRegion.startMillis / 1000,
      end: scenePlaybackRegion.endMillis / 1000,
      color: '#fff',
      data: { handled: true }
    });
    this.connectRegion(waveSurferRegion, scene, scenePlaybackRegion);

    // add all presets
    // TODO
    // for (let presetUuid of scene.presetUuids) {
    //   const preset = this.presetService.getPresetByUuid(presetUuid);

    //   let waveSurferRegion = this.timelineService.waveSurfer.addRegion({
    //     start: (scenePlaybackRegion.startMillis + (preset.startMillis ? preset.startMillis : 0)) / 1000,
    //     end: (scenePlaybackRegion.startMillis + (preset.endMillis ? preset.endMillis : scenePlaybackRegion.endMillis - scenePlaybackRegion.startMillis)) / 1000,
    //     color: '#fff',
    //     data: { handled: true },
    //     // TODO
    //     attributes: {
    //       preset: true,
    //       name: 'Preset 1'
    //     }
    //   });
    //   this.connectRegion(waveSurferRegion, scene, scenePlaybackRegion, preset);
    // }

    this.updateRegionSelection();
  }

  drawAllRegions() {
    for (let scene of this.sceneService.scenes) {
      for (let scenePlaybackRegion of scene.scenePlaybackRegionList) {
        this.drawRegion(scenePlaybackRegion, scene);
      }
    }
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
      waveSurferRegion.color = 'rgba(' + this.hexToRgb(this.sceneService.selectedScenes[0].color).r + ', ' + this.hexToRgb(this.sceneService.selectedScenes[0].color).g + ', ' + this.hexToRgb(this.sceneService.selectedScenes[0].color).b + ', ' + this.intensityHighlighted + ')';
      waveSurferRegion.attributes.selectable = true;
      this.connectRegion(waveSurferRegion, this.sceneService.selectedScenes[0], scenePlaybackRegion);
      this.updateRegionSelection();
    } else {
      this.drawRegion(scenePlaybackRegion, this.sceneService.selectedScenes[0]);
    }
  }

  removeRegion() {

  }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key == ' ') {
      if (this.timelineService.playState == 'paused') {
        this.play();
      } else {
        this.pause();
      }
    }
  }

}
