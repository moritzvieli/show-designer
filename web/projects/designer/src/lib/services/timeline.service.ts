import { Injectable } from '@angular/core';
import { Subscription, timer, Subject, Observable } from 'rxjs';
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
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class TimelineService {

  public waveSurfer: WaveSurfer;
  public playState: string = 'paused';

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
  public selectedComposition: Composition;
  public selectedCompositionIndex: number;

  // can we add new compositions based on an external pool and
  // should new compositions not available in this pool be added there?
  public externalCompositionsAvailable: boolean = false;

  public loadingAudioFile: boolean = false;

  constructor(
    private sceneService: SceneService,
    private presetService: PresetService,
    private projectService: ProjectService,
    private http: HttpClient,
    private configService: ConfigService
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
    if (this.selectedComposition.gridType == 'musical') {
      return Math.round(seconds / this.selectedComposition.timeSignatureUpper / (60 / this.selectedComposition.beatsPerMinute));
    } else {
      // calculate minutes and seconds from seconds count
      const minutes = parseInt(<any>(seconds / 60), 10);
      seconds = parseInt(<any>(seconds % 60), 10);

      // fill up seconds with zeroes
      const secondsStr = seconds < 10 ? '0' + seconds : seconds;
      return `${minutes}:${secondsStr}`;
    }
  }

  timeInterval(pxPerSec: number) {
    if (this.selectedComposition.gridType == 'musical') {
      let interval = 60 / this.selectedComposition.beatsPerMinute / this.selectedComposition.gridResolution;

      if (pxPerSec < 40) {
        return interval * 4;
      } else if (pxPerSec < 80) {
        return interval * 2;
      }

      return interval;
    } else {
      if (pxPerSec >= 25) {
        return 1;
      } else if (pxPerSec * 5 >= 25) {
        return 5;
      } else if (pxPerSec * 15 >= 25) {
        return 15;
      }

      return Math.ceil(0.5 / pxPerSec) * 60;
    }
  }

  primaryLabelInterval(pxPerSec: number) {
    if (this.selectedComposition.gridType == 'musical') {
      let interval = this.selectedComposition.timeSignatureUpper * this.selectedComposition.gridResolution;

      return interval;
    } else {
      if (pxPerSec >= 25) {
        return 10;
      } else if (pxPerSec * 5 >= 25) {
        return 6;
      } else if (pxPerSec * 15 >= 25) {
        return 4;
      }

      return 4;
    }
  }

  secondaryLabelInterval(pxPerSec: number) {
    if (this.selectedComposition.gridType == 'musical') {
      return 0;
    } else {
      if (pxPerSec >= 25) {
        return 5;
      } else if (pxPerSec * 5 >= 25) {
        return 2;
      } else if (pxPerSec * 15 >= 25) {
        return 2;
      }
      return 2;
    }
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

    progress = Math.max(progress, 0);

    setTimeout(() => {
      this.waveSurfer.seekTo(progress);
      this.detectChanges.next();
      this.presetService.previewLive(this.selectedComposition.name, Math.round(this.waveSurfer.getCurrentTime() * 1000));
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

    if (!this.selectedComposition) {
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

    this.presetService.previewLive();
  }

  private getSnapToGridInterval(): number {
    if (this.selectedComposition.snapToGrid) {
      return 60 / this.selectedComposition.beatsPerMinute / this.selectedComposition.gridResolution;
    }

    return undefined;
  }

  private getSnapToGridOffset(): number {
    return this.selectedComposition.gridOffsetMillis / 1000;
  }

  deleteSelectedComposition() {
    this.projectService.project.compositions.splice(this.selectedCompositionIndex, 1);
    this.selectedComposition = undefined;
    this.selectedCompositionIndex = undefined;
    this.destroyWaveSurfer();
    if (this.projectService.project.compositions.length > 0) {
      this.selectCompositionIndex(0);
    }
  }

  destroyWaveSurfer() {
    this.duration = undefined;
    this.loadingAudioFile = false;

    if (this.waveSurfer) {
      this.waveSurfer.destroy();
      this.waveSurfer = undefined;
    }
  }

  createWaveSurfer() {
    this.destroyWaveSurfer();

    if (!this.selectedComposition.audioFileName) {
      return;
    }

    this.loadingAudioFile = true;

    setTimeout(() => {
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
            snapToGridInterval: this.getSnapToGridInterval(),
            snapToGridOffset: this.getSnapToGridOffset()
          }),
          TimeLinePlugin.create({
            container: "#waveform-timeline",
            primaryFontColor: '#fff',
            secondaryFontColor: '#fff',
            offset: this.getSnapToGridOffset(),
            formatTimeCallback: this.formatTimeCallback.bind(this),
            timeInterval: this.timeInterval.bind(this),
            primaryLabelInterval: this.primaryLabelInterval.bind(this),
            secondaryLabelInterval: this.secondaryLabelInterval.bind(this),
          })
        ]
      });

      let audioFileName: string;

      if (this.configService.enableMediaLibrary) {
        // the file name is also used for the real file name
        audioFileName = 'file/get?name=' + this.selectedComposition.audioFileName + '&type=AUDIO';
      } else {
        // the composition uuid and extension is used as the file name
        audioFileName = 'composition-files/?file=' + this.selectedComposition.uuid + '.' + this.selectedComposition.audioFileName.substr(this.selectedComposition.audioFileName.lastIndexOf('.') + 1);
      }

      this.waveSurfer.load(this.configService.restUrl + audioFileName);

      this.waveSurfer.on('ready', () => {
        setTimeout(() => {
          this.loadingAudioFile = false;

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

      this.waveSurfer.on('error', (error: any) => {
        // could not load the composition --> delete it
        // (this may occur, when the composition has been deleted but the project is not saved afterwards)
        this.deleteSelectedComposition();
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
        this.presetService.previewLive();
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

  private getRegionSnapToGridValue(value: number): number {
    // the regions should snap to a grid
    const offset = this.getSnapToGridOffset() || 0;
    const interval = this.getSnapToGridInterval() || 0;
    return (Math.round((value - offset) / interval) * interval + offset);
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

    waveSurferRegion.on('update', () => {
      this.setSelectedRegion(scenePlaybackRegion);
      if (this.selectedComposition.snapToGrid) {
        // update the regions boundaries. they may not snap to grid, if it has been
        // disabled during creation of the region but activated afterwards.
        waveSurferRegion.start = this.getRegionSnapToGridValue(waveSurferRegion.start);
        waveSurferRegion.end = this.getRegionSnapToGridValue(waveSurferRegion.end);
      }
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

    this.presetService.previewLive();
  }

  getPresetsInTime(timeMillis: number): PresetRegionScene[] {
    // Return all presets which should be active during the specified time
    let activePresets: PresetRegionScene[] = [];

    for (let sceneIndex = this.projectService.project.scenes.length - 1; sceneIndex >= 0; sceneIndex--) {
      let scene = this.projectService.project.scenes[sceneIndex];

      for (let region of this.selectedComposition.scenePlaybackRegions) {
        if (region.sceneUuid == scene.uuid && region.startMillis <= timeMillis && region.endMillis >= timeMillis) {
          // This region is currently being played -> check all scene presets
          for (let presetIndex = this.projectService.project.presets.length - 1; presetIndex >= 0; presetIndex--) {
            for (let presetUuid of scene.presetUuids) {
              if (presetUuid == this.projectService.project.presets[presetIndex].uuid) {
                let preset = this.presetService.getPresetByUuid(presetUuid);

                if (preset) {
                  if ((!preset.startMillis || preset.startMillis + region.startMillis <= timeMillis)
                    && (!preset.endMillis || preset.endMillis + region.startMillis >= timeMillis)) {

                    activePresets.push(new PresetRegionScene(preset, region, scene));
                  }
                }
              }
            }
          }
        }
      }
    }

    return activePresets;
  }

  drawAllRegions() {
    if (!this.selectedComposition) {
      return;
    }

    for (let scenePlaybackRegion of this.selectedComposition.scenePlaybackRegions) {
      this.drawRegion(scenePlaybackRegion, this.sceneService.getSceneByUuid(scenePlaybackRegion.sceneUuid));
    }
  }

  updateGrid() {
    if (this.waveSurferReady) {
      this.waveSurfer.timeline.params.offset = this.getSnapToGridOffset();

      this.waveSurfer.regions.params.snapToGridInterval = this.getSnapToGridInterval();
      this.waveSurfer.regions.params.snapToGridOffset = this.getSnapToGridOffset();
    }
    this.updateCurrentTime();
  }

  getExternalCompositionNames(): Observable<string[]> {
    // get available compositions from an external pool (e.g. Rocket Show)
    return this.http.get('composition/list').pipe(map((response: Array<Object>) => {
      let compositionNames: string[] = [];

      for (let responseComposition of response) {
        compositionNames.push((<any>responseComposition).name);
      }

      return compositionNames;
    }));
  }

  selectCompositionIndex(index: number) {
    this.selectedComposition = this.projectService.project.compositions[index];
    this.selectedCompositionIndex = index;
    this.projectService.project.selectedCompositionUuid = this.selectedComposition.uuid;
    this.createWaveSurfer();

    // required to trigger timeline.component.resize()
    this.waveSurferReady.next();

    this.applyZoom(0);
  }

}
