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
  private timelineClicking: boolean = false;

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

  formatTimeCallback(seconds: number, pxPerSec: number) {
    if (this.timelineService.gridType == 'musical') {
      return Math.round(seconds / this.timelineService.timeSignatureUpper / (60 / this.timelineService.beatsPerMinute));
    }





    // calculate minutes and seconds from seconds count
    const minutes: number = Math.round(seconds / 60);
    seconds = Math.round(seconds % 60);

    // fill up seconds with zeroes
    let secondsStr = seconds < 10 ? '0' + seconds : seconds;
    console.log('aaa', `${minutes}:${secondsStr}`);
    return `${minutes}:${secondsStr}`;
  }

  timeInterval(pxPerSec: number) {
    if (this.timelineService.gridType == 'musical') {
      return 60 / this.timelineService.beatsPerMinute;
    }




    let retval = 1;

    if (pxPerSec >= 25 * 100) {
      retval = 0.01;
    } else if (pxPerSec >= 25 * 40) {
      retval = 0.025;
    } else if (pxPerSec >= 25 * 10) {
      retval = 0.1;
    } else if (pxPerSec >= 25 * 4) {
      retval = 0.25;
    } else if (pxPerSec >= 25) {
      retval = 1;
    } else if (pxPerSec * 5 >= 25) {
      retval = 5;
    } else if (pxPerSec * 15 >= 25) {
      retval = 15;
    } else {
      retval = Math.ceil(0.5 / pxPerSec) * 60;
    }

    return retval;
  }

  primaryLabelInterval(pxPerSec: number) {
    if (this.timelineService.gridType == 'musical') {
      return this.timelineService.timeSignatureUpper / this.timelineService.timeSignatureLower * this.timelineService.gridResolution;
    }





    let retval = 1;

    if (pxPerSec >= 25 * 100) {
      retval = 10;
    } else if (pxPerSec >= 25 * 40) {
      retval = 4;
    } else if (pxPerSec >= 25 * 10) {
      retval = 10;
    } else if (pxPerSec >= 25 * 4) {
      retval = 4;
    } else if (pxPerSec >= 25) {
      retval = 1;
    } else if (pxPerSec * 5 >= 25) {
      retval = 5;
    } else if (pxPerSec * 15 >= 25) {
      retval = 15;
    } else {
      retval = Math.ceil(0.5 / pxPerSec) * 60;
    }

    return retval;
  }

  secondaryLabelInterval(pxPerSec: number) {
    if (this.timelineService.gridType == 'musical') {
      return 0;
    }




    // draw one every 10s as an example
    return Math.floor(10 / this.timeInterval(pxPerSec));
  }

  private seeekWithTimeline(e: any) {
    // taken from wavesurfer -> drawer -> handleEvent
    const clientX = e.targetTouches
      ? e.targetTouches[0].clientX
      : e.clientX;
    const bbox = this.timelineService.waveSurfer.timeline.wrapper.getBoundingClientRect();

    const nominalWidth = this.timelineService.waveSurfer.timeline.drawer.width;
    const parentWidth = this.timelineService.waveSurfer.timeline.drawer.getWidth();

    let progress: number;

    if (!this.timelineService.waveSurfer.timeline.drawer.params.fillParent && nominalWidth < parentWidth) {
      progress =
        (this.timelineService.waveSurfer.timeline.drawer.params.rtl ? bbox.right - clientX : clientX - bbox.left) *
        (this.timelineService.waveSurfer.timeline.drawer.params.pixelRatio / nominalWidth) || 0;

      if (progress > 1) {
        progress = 1;
      }
    } else {
      progress =
        ((this.timelineService.waveSurfer.timeline.drawer.params.rtl
          ? bbox.right - clientX
          : clientX - bbox.left) +
          this.timelineService.waveSurfer.timeline.wrapper.scrollLeft) /
        this.timelineService.waveSurfer.timeline.wrapper.scrollWidth || 0;
    }

    setTimeout(() => {
      this.timelineService.waveSurfer.seekTo(progress);
      this.changeDetectorRef.detectChanges();
    }, 0);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      // TODO what if I change the grid type?
      this.timelineService.waveSurfer = WaveSurfer.create({
        container: '#waveform',
        waveColor: 'white',
        progressColor: 'white',
        //barWidth: 2,
        height: 1,
        interact: false,
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
            snapToGridInterval: 60 / this.timelineService.beatsPerMinute,
            snapToGridOffset: this.timelineService.gridOffsetMillis / 1000
          }),
          TimeLinePlugin.create({
            container: "#waveform-timeline",
            primaryFontColor: '#fff',
            secondaryFontColor: '#fff',
            offset: this.timelineService.gridOffsetMillis / 1000,
            formatTimeCallback: this.formatTimeCallback.bind(this),
            timeInterval: this.timeInterval.bind(this),
            primaryLabelInterval: this.primaryLabelInterval.bind(this),
            secondaryLabelInterval: this.secondaryLabelInterval.bind(this),
          })
        ]
      });
      this.timelineService.waveSurfer.load('../../assets/test.wav');


      this.timelineService.waveSurfer.on('ready', () => {
        setTimeout(() => {
          this.duration = this.msToTime(this.timelineService.waveSurfer.getDuration() * 1000);
          this.changeDetectorRef.detectChanges();
          this.onResize();
          this.drawAllRegions();

          // scroll wavesurfer in sync with the timeline
          this.timelineService.waveSurfer.timeline.wrapper.addEventListener('scroll', () => {
            this.timelineService.waveSurfer.drawer.wrapper.scrollLeft = this.timelineService.waveSurfer.timeline.wrapper.scrollLeft;

            // Set the scroll position of the timeline to the same position as the wavesurfer,
            // because the timeline is larger than wavesurfer and might get out of sync.
            // This way, if wavesurfer cannot scroll any further, we reset the position
            // of the timeline as well.
            this.timelineService.waveSurfer.timeline.wrapper.scrollLeft = this.timelineService.waveSurfer.drawer.wrapper.scrollLeft;
          });

          // display the cursor also on the timeline
          this.timelineService.waveSurfer.timeline.wrapper.addEventListener('mouseenter', () => {
            this.timelineService.waveSurfer.cursor.showCursor();
          });
          this.timelineService.waveSurfer.timeline.wrapper.addEventListener('mouseleave', () => {
            this.timelineService.waveSurfer.cursor.hideCursor();
          });
          this.timelineService.waveSurfer.timeline.wrapper.addEventListener('mousemove', (e: any) => {
            const bbox = this.timelineService.waveSurfer.container.getBoundingClientRect();
            let x = e.clientX - bbox.left;
            this.timelineService.waveSurfer.cursor.updateCursorPosition(x, 0);
          });

          // hide the cursor on the wave initially. in combination with the param hideOnBlur = false,
          // it will never be displayed on the wave now. we handle it on the timeline only.
          this.timelineService.waveSurfer.cursor.hideCursor();

          // seek on timeline-click
          this.timelineService.waveSurfer.timeline.wrapper.addEventListener('mousedown', (e: any) => {
            this.timelineClicking = true;
            this.seeekWithTimeline(e);
          });

          this.timelineService.waveSurfer.timeline.wrapper.addEventListener('mousemove', (e: any) => {
            if (this.timelineClicking) {
              this.seeekWithTimeline(e);
            }
          });

          this.timelineService.waveSurfer.timeline.wrapper.addEventListener('mouseup', (e: any) => {
            this.timelineClicking = false;
          });

          this.updateCurrentTime();
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

      this.timelineService.waveSurfer.on('region-updated', (region: any) => {
        this.changeDetectorRef.detectChanges();
      });
    }, 0);
  }

  private updateCurrentTime() {
    if (this.timelineService.waveSurfer && this.timelineService.waveSurfer.timeline.drawer) {
      // display the current time
      this.currentTime = this.msToTime(this.timelineService.waveSurfer.getCurrentTime() * 1000);

      // draw the current cursor on the timeline
      // TODO redrawing the timeline each update is way to expensive.
      // maybe as a better solution use an element, like the cursor inside Wavesurfer to
      // display the progress?
      let x: number = 0;
      let duration: number = this.timelineService.waveSurfer.backend.getDuration();
      let width: number =
        this.timelineService.waveSurfer.params.fillParent && !this.timelineService.waveSurfer.params.scrollParent
          ? this.timelineService.waveSurfer.timeline.drawer.getWidth()
          : this.timelineService.waveSurfer.timeline.drawer.wrapper.scrollWidth * this.timelineService.waveSurfer.params.pixelRatio;

      x = width / duration * this.timelineService.waveSurfer.getCurrentTime() - 2;

      // update the timeline canvas
      this.timelineService.waveSurfer.timeline.render();

      // draw the cursor on the timeline
      this.timelineService.waveSurfer.timeline.canvases.forEach((canvas, i) => {
        const leftOffset = i * this.timelineService.waveSurfer.timeline.maxCanvasWidth;

        var ctx = canvas.getContext('2d');

        ctx.fillStyle = '#fd7e14';
        ctx.beginPath();
        ctx.moveTo(x - 12 - leftOffset, 20);
        ctx.lineTo(x + 12 - leftOffset, 20);
        ctx.lineTo(x - leftOffset, 45);
        ctx.fill();
      });
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
    if (zoom < 0 || zoom > 200) {
      return;
    }

    this.zoom = zoom;
    if (this.timelineService.waveSurfer) {
      setTimeout(() => {
        this.timelineService.waveSurfer.zoom(this.zoom);
        this.updateCurrentTime();
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
    const waveSurferRegion = this.timelineService.waveSurfer.addRegion({
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
