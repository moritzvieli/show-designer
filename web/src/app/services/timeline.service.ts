import { Injectable } from '@angular/core';
import { Subscription, timer, Subject } from 'rxjs';
import WaveSurfer from 'wavesurfer.js';
import CursorPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.cursor.min.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min.js';
import TimeLinePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.timeline.min.js';
import { SceneService } from './scene.service';
import { ScenePlaybackRegion } from '../models/scene-playback-region';
import { PresetService } from './preset.service';
import { Scene } from '../models/scene';
import { Preset } from '../models/preset';
import { ProjectService } from './project.service';
import { Composition } from '../models/composition';
import { PresetRegionScene } from '../models/preset-region-scene';

@Injectable({
  providedIn: 'root'
})
export class TimelineService {

  public waveSurfer: WaveSurfer;
  public playState: string = 'paused';

  // TODO move to the composition
  public beatsPerMinute: number = 178;
  public timeSignatureUpper: number = 6;
  public timeSignatureLower: number = 8;

  public snapToGrid: boolean = true;
  // time based or musical
  public gridType: string = 'musical';
  // e.g. 1/1, 1/2, 1/4, etc.
  public gridResolution: number = 8;
  public gridOffsetMillis: number = 50;

  public zoom = 0;
  private timeUpdateSubscription: Subscription;
  public currentTime: string;
  private timelineClicking: boolean = false;
  public selectedPlaybackRegion: ScenePlaybackRegion;
  private intensity = 0.2;
  private intensitySelectedScene = 0.4;
  private intensityHighlighted = 0.8;
  public duration: string;
  public waveSurferReady: Subject<void> = new Subject();
  public detectChanges: Subject<void> = new Subject();

  // the current composition
  selectedComposition: Composition;

  constructor(
    private sceneService: SceneService,
    private presetService: PresetService,
    private projectService: ProjectService
  ) {
    this.presetService.previewSelectionChanged.subscribe(() => {
      this.selectedPlaybackRegion = undefined;
      this.updateRegionSelection();
    });
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

  private updateCurrentTime() {
    if (!this.waveSurfer) {
      return;
    }

    // display the current time
    this.currentTime = this.msToTime(this.waveSurfer.getCurrentTime() * 1000);

    if (!this.waveSurfer.timeline.drawer) {
      return;
    }

    // draw the current cursor on the timeline
    // TODO redrawing the timeline each update is way to expensive.
    // maybe as a better solution use an element, like the cursor inside Wavesurfer to
    // display the progress?
    let x: number = 0;
    let duration: number = this.waveSurfer.backend.getDuration();
    let width: number =
      this.waveSurfer.params.fillParent && !this.waveSurfer.params.scrollParent
        ? this.waveSurfer.timeline.drawer.getWidth()
        : this.waveSurfer.timeline.drawer.wrapper.scrollWidth * this.waveSurfer.params.pixelRatio;

    x = width / duration * this.waveSurfer.getCurrentTime() - 2;

    // update the timeline canvas
    this.waveSurfer.timeline.render();

    // draw the cursor on the timeline
    this.waveSurfer.timeline.canvases.forEach((canvas, i) => {
      const leftOffset = i * this.waveSurfer.timeline.maxCanvasWidth;

      var ctx = canvas.getContext('2d');

      ctx.fillStyle = '#fd7e14';
      ctx.beginPath();
      ctx.moveTo(x - 12 - leftOffset, 20);
      ctx.lineTo(x + 12 - leftOffset, 20);
      ctx.lineTo(x - leftOffset, 45);
      ctx.fill();
    });
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

  formatTimeCallback(seconds: number, pxPerSec: number) {
    if (this.gridType == 'musical') {
      return Math.round(seconds / this.timeSignatureUpper / (60 / this.beatsPerMinute));
    }

    // calculate minutes and seconds from seconds count
    const minutes = parseInt(<any>(seconds / 60), 10);
    seconds = parseInt(<any>(seconds % 60), 10);

    // fill up seconds with zeroes
    const secondsStr = seconds < 10 ? '0' + seconds : seconds;
    return `${minutes}:${secondsStr}`;
  }

  timeInterval(pxPerSec: number) {
    if (this.gridType == 'musical') {
      return 60 / this.beatsPerMinute;
    }

    if (pxPerSec >= 25) {
      return 1;
    } else if (pxPerSec * 5 >= 25) {
      return 5;
    } else if (pxPerSec * 15 >= 25) {
      return 15;
    }
    return Math.ceil(0.5 / pxPerSec) * 60;
  }

  primaryLabelInterval(pxPerSec: number) {
    if (this.gridType == 'musical') {
      return this.timeSignatureUpper / this.timeSignatureLower * this.gridResolution;
    }

    if (pxPerSec >= 25) {
      return 10;
    } else if (pxPerSec * 5 >= 25) {
      return 6;
    } else if (pxPerSec * 15 >= 25) {
      return 4;
    }
    return 4;
  }

  secondaryLabelInterval(pxPerSec: number) {
    if (this.gridType == 'musical') {
      return 0;
    }

    if (pxPerSec >= 25) {
      return 5;
    } else if (pxPerSec * 5 >= 25) {
      return 2;
    } else if (pxPerSec * 15 >= 25) {
      return 2;
    }
    return 2;
  }

  private seeekWithTimeline(e: any) {
    // taken from wavesurfer -> drawer -> handleEvent
    const clientX = e.targetTouches
      ? e.targetTouches[0].clientX
      : e.clientX;
    const bbox = this.waveSurfer.timeline.wrapper.getBoundingClientRect();

    const nominalWidth = this.waveSurfer.timeline.drawer.width;
    const parentWidth = this.waveSurfer.timeline.drawer.getWidth();

    let progress: number;

    if (!this.waveSurfer.timeline.drawer.params.fillParent && nominalWidth < parentWidth) {
      progress =
        (this.waveSurfer.timeline.drawer.params.rtl ? bbox.right - clientX : clientX - bbox.left) *
        (this.waveSurfer.timeline.drawer.params.pixelRatio / nominalWidth) || 0;

      if (progress > 1) {
        progress = 1;
      }
    } else {
      progress =
        ((this.waveSurfer.timeline.drawer.params.rtl
          ? bbox.right - clientX
          : clientX - bbox.left) +
          this.waveSurfer.timeline.wrapper.scrollLeft) /
        this.waveSurfer.timeline.wrapper.scrollWidth || 0;
    }

    setTimeout(() => {
      this.waveSurfer.seekTo(progress);
      this.detectChanges.next();
    }, 0);
  }

  applyZoom(zoom: any) {
    if (zoom < 0 || zoom > 200) {
      return;
    }

    this.zoom = zoom;
    if (this.waveSurfer) {
      setTimeout(() => {
        this.waveSurfer.zoom(this.zoom);
        this.updateCurrentTime();
      }, 0);
    }
  }

  private isWaveSurferReady(): boolean {
    if (!this.waveSurfer) {
      return false;
    }

    if (!this.waveSurfer.isReady) {
      return false;
    }

    return true;
  }

  addRegion(waveSurferRegion?: any) {
    if (!this.isWaveSurferReady()) {
      return;
    }

    if (!this.sceneService.selectedScenes || this.sceneService.selectedScenes.length != 1) {
      return;
    }

    if(!this.selectedComposition) {
      return;
    }

    let scenePlaybackRegion: ScenePlaybackRegion = new ScenePlaybackRegion();
    scenePlaybackRegion.sceneUuid = this.sceneService.selectedScenes[0].uuid;

    if (waveSurferRegion) {
      scenePlaybackRegion.startMillis = waveSurferRegion.start * 1000;
      scenePlaybackRegion.endMillis = waveSurferRegion.end * 1000;
    } else {
      scenePlaybackRegion.startMillis = this.waveSurfer.getDuration() * 1000 / 3;
      scenePlaybackRegion.endMillis = this.waveSurfer.getDuration() * 1000 / 3 * 2;
    }

    this.selectedComposition.scenePlaybackRegions.push(scenePlaybackRegion);

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

  createWaveSurfer() {
    setTimeout(() => {
      // TODO what if I change the grid type?
      this.waveSurfer = WaveSurfer.create({
        container: '#waveform',
        waveColor: 'white',
        progressColor: 'white',
        //barWidth: 2,
        height: 1,
        interact: false,
        // Use for timelines without sound. Wave will be displayed
        // wrong, but should work for a dummy audio without any waves.
        //duration: 400,
        plugins: [
          CursorPlugin.create({
            // showTime: true,
            opacity: 1,
            color: '#fd7e14',
            hideOnBlur: false /* don't show/hide the cursor on the wave (only on the timeline) */
          }),
          RegionsPlugin.create({
            dragSelection: {
              slop: 5
            },
            color: '#fff',
            snapToGridInterval: 60 / this.beatsPerMinute,
            snapToGridOffset: this.gridOffsetMillis / 1000
          }),
          TimeLinePlugin.create({
            container: "#waveform-timeline",
            primaryFontColor: '#fff',
            secondaryFontColor: '#fff',
            offset: this.gridOffsetMillis / 1000,
            formatTimeCallback: this.formatTimeCallback.bind(this),
            timeInterval: this.timeInterval.bind(this),
            primaryLabelInterval: this.primaryLabelInterval.bind(this),
            secondaryLabelInterval: this.secondaryLabelInterval.bind(this),
          })
        ]
      });
      this.waveSurfer.load('../../assets/test.wav');

      this.waveSurfer.on('ready', () => {
        setTimeout(() => {
          this.duration = this.msToTime(this.waveSurfer.getDuration() * 1000);
          this.drawAllRegions();

          // scroll wavesurfer in sync with the timeline
          this.waveSurfer.timeline.wrapper.addEventListener('scroll', () => {
            this.waveSurfer.drawer.wrapper.scrollLeft = this.waveSurfer.timeline.wrapper.scrollLeft;

            // Set the scroll position of the timeline to the same position as the wavesurfer,
            // because the timeline is larger than wavesurfer and might get out of sync.
            // This way, if wavesurfer cannot scroll any further, we reset the position
            // of the timeline as well.
            this.waveSurfer.timeline.wrapper.scrollLeft = this.waveSurfer.drawer.wrapper.scrollLeft;
          });

          // display the cursor also on the timeline
          this.waveSurfer.timeline.wrapper.addEventListener('mouseenter', () => {
            this.waveSurfer.cursor.showCursor();
          });
          this.waveSurfer.timeline.wrapper.addEventListener('mouseleave', () => {
            this.waveSurfer.cursor.hideCursor();
          });
          this.waveSurfer.timeline.wrapper.addEventListener('mousemove', (e: any) => {
            const bbox = this.waveSurfer.container.getBoundingClientRect();
            let x = e.clientX - bbox.left;
            this.waveSurfer.cursor.updateCursorPosition(x, 0);
          });

          // hide the cursor on the wave initially. in combination with the param hideOnBlur = false,
          // it will never be displayed on the wave now. we handle it on the timeline only.
          this.waveSurfer.cursor.hideCursor();

          // seek on timeline-click
          this.waveSurfer.timeline.wrapper.addEventListener('mousedown', (e: any) => {
            this.timelineClicking = true;
            this.seeekWithTimeline(e);
          });

          this.waveSurfer.timeline.wrapper.addEventListener('mousemove', (e: any) => {
            if (this.timelineClicking) {
              this.seeekWithTimeline(e);
            }
          });

          this.waveSurfer.timeline.wrapper.addEventListener('mouseup', (e: any) => {
            this.timelineClicking = false;
          });

          this.updateCurrentTime();

          this.detectChanges.next();
          this.waveSurferReady.next();
        }, 0);
      });

      this.waveSurfer.on('seek', () => {
        this.updateCurrentTime();
      });

      this.waveSurfer.on('play', () => {
        this.startTimeUpdater();
      });

      this.waveSurfer.on('pause', () => {
        this.stopTimeUpdater();
      });

      this.waveSurfer.on('region-created', (region) => {
        // Region created by selection
        if (this.sceneService.selectedScenes && this.sceneService.selectedScenes.length == 1) {
          if (!region.data.handled) {
            this.addRegion(region);
          }
        } else {
          region.remove();
        }
      });

      this.waveSurfer.on('region-updated', (region: any) => {
        this.detectChanges.next();
      });
    }, 0);
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
    if (!this.waveSurfer) {
      return;
    }

    for (let key of Object.keys(this.waveSurfer.regions.list)) {
      let region: any = this.waveSurfer.regions.list[key];
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
      if (this.sceneService.sceneIsSelected(scene)) {
        this.setSelectedRegion(scenePlaybackRegion);
      }
    });

    waveSurferRegion.on('update', (x) => {
      this.setSelectedRegion(scenePlaybackRegion);
      scenePlaybackRegion.startMillis = waveSurferRegion.start * 1000;
      scenePlaybackRegion.endMillis = waveSurferRegion.end * 1000;
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
    const waveSurferRegion = this.waveSurfer.addRegion({
      start: scenePlaybackRegion.startMillis / 1000,
      end: scenePlaybackRegion.endMillis / 1000,
      color: '#fff',
      data: { handled: true }
    });
    this.connectRegion(waveSurferRegion, scene, scenePlaybackRegion);

    // TODO show the all presets
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

  removeRegion() {
    if (!this.selectedPlaybackRegion) {
      return;
    }

    if (this.sceneService.selectedScenes.length != 1) {
      return;
    }

    for (let i = 0; i < this.selectedComposition.scenePlaybackRegions.length; i++) {
      if (this.selectedComposition.scenePlaybackRegions[i] == this.selectedPlaybackRegion) {
        // remove the region from wavesurfer
        for (let key of Object.keys(this.waveSurfer.regions.list)) {
          let region: any = this.waveSurfer.regions.list[key];

          if (region.scenePlaybackRegion == this.selectedPlaybackRegion) {
            region.remove();
          }
        }

        this.selectedPlaybackRegion = undefined;
        this.selectedComposition.scenePlaybackRegions.splice(i, 1);

        return;
      }
    }
  }

  getPresetsInTime(timeMillis: number): PresetRegionScene[] {
    // Return all scenes which should be active during the specified time
    let activePresets: PresetRegionScene[] = [];

    for (let scene of this.projectService.project.scenes) {
      for (let region of this.selectedComposition.scenePlaybackRegions) {
        if (region.startMillis <= timeMillis && region.endMillis >= timeMillis) {
          // This region is currently being played -> check all scene presets
          for (let presetUuid of scene.presetUuids) {
            let preset = this.presetService.getPresetByUuid(presetUuid);

            if ((!preset.startMillis || preset.startMillis + region.startMillis <= timeMillis)
              && (!preset.endMillis || preset.endMillis + region.startMillis >= timeMillis)) {

              activePresets.push(new PresetRegionScene(preset, region, scene));
            }
          }
        }
      }
    }

    return activePresets;
  }

  drawAllRegions() {
    if(!this.selectedComposition) {
      return;
    }

    for (let scenePlaybackRegion of this.selectedComposition.scenePlaybackRegions) {
      this.drawRegion(scenePlaybackRegion, this.sceneService.getSceneByUuid(scenePlaybackRegion.sceneUuid));
    }
  }

  updateGrid() {
    console.log('TODO update grid');
    // TODO
    this.updateCurrentTime();
  }

}
