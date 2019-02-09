import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import WaveSurfer from 'wavesurfer.js';
import CursorPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.cursor.min.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min.js';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
export class TimelineComponent implements OnInit {

  @ViewChild('waveWrapper')
  waveWrapper: ElementRef;

  constructor() { }

  ngOnInit() {
  }

  play() {
    var wavesurfer = WaveSurfer.create({
      container: '#waveform',
      waveColor: 'white',
      progressColor: 'gray',
      height: 1,
      plugins: [
        CursorPlugin.create({
          showTime: true,
          opacity: 1,
          customShowTimeStyle: {
            'background-color': '#000',
            color: '#fff',
            padding: '2px',
            'font-size': '10px'
          }
        }),
        RegionsPlugin.create({})
      ]
    });
    wavesurfer.setHeight(this.waveWrapper.nativeElement.clientHeight);
    wavesurfer.load('../../assets/test.mp3');

    wavesurfer.zoom(130);

    // let audio = new Audio();
    // audio.src = "../../assets/test.mp3";
    // audio.load();
    // audio.play();
    // audio.volume = 0.1;
    // audio.currentTime = 12;
    // console.log(audio.currentTime);
    // setTimeout(() => {
    //   console.log(audio.currentTime);
    // }, 5500);
  }

}
