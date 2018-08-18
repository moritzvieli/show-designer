import { EffectCurve } from './../../models/effect-curve';
import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-effect-curve',
  templateUrl: './effect-curve.component.html',
  styleUrls: ['./effect-curve.component.css']
})
export class EffectCurveComponent implements OnInit {

  @Input() curve: EffectCurve;

  @ViewChild('curveGrid') curveGrid: ElementRef;

  constructor() { }

  ngOnInit() {
    this.redraw();
  }

  redraw() {
    while (this.curveGrid.nativeElement.lastChild) {
      this.curveGrid.nativeElement.removeChild(this.curveGrid.nativeElement.lastChild);
    }

    var svgns = "http://www.w3.org/2000/svg";
    let width: number = 150;

    for (var i = 0; i < 5000; i += 15) {
      let val = this.curve.getValueAtMillis(i);

      // Scale the value to the svg
      val = 5000 * val / 255;

      var rect = document.createElementNS(svgns, 'rect');
      rect.setAttributeNS(null, 'x', i.toString());
      rect.setAttributeNS(null, 'y', (val - width).toString());
      rect.setAttributeNS(null, 'width', width.toString());
      rect.setAttributeNS(null, 'height', (width * 2).toString());
      rect.setAttributeNS(null, 'fill', '#fff');
      this.curveGrid.nativeElement.appendChild(rect);
    }
  }

}
