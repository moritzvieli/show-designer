import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import * as d3 from "d3";

@Component({
  selector: 'app-effect-pan-tilt',
  templateUrl: './effect-pan-tilt.component.html',
  styleUrls: ['./effect-pan-tilt.component.css']
})
export class EffectPanTiltComponent implements OnInit {

  @ViewChild('panTiltGrid', {static: false}) panTiltGrid: ElementRef;

  private line = d3.line();
  private svg;
  private path;

  private points = [
    [0, 500],
    [500, 0],
    [1000, 500],
    [500, 1000]
  ];

  private dragged = null;
  private selected = this.points[0];

  constructor() { }

  private redraw() {
    //this.svg.select("path").attr("d", this.line);

    // var circle = this.svg.selectAll("circle")
    //   .data(this.points, function (d) { return d; });

    // circle.enter().append("circle")
    //   .attr("r", 5)
    //   .on("mousedown", ((d) => { this.selected = this.dragged = d; this.redraw(); }))
    //   .attr("r", 6.5);

    // circle
    //   .classed("selected", ((d) => { return d === this.selected; }))
    //   .attr("cx", function (d) { return d[0]; })
    //   .attr("cy", function (d) { return d[1]; });

    // circle.exit().remove();

    // if (d3.event) {
    //   d3.event.preventDefault();
    //   d3.event.stopPropagation();
    // }
  }

  private translateAlong(path) {
    var l = path.getTotalLength();
    return function (d, i, a) {
      return function (t) {
        var p = path.getPointAtLength(t * l);
        //console.log(p);
        return "translate(" + p.x + "," + p.y + ")";
      };
    };
  }

  ngOnInit() {
    this.svg = d3.select(this.panTiltGrid.nativeElement);
    this.path = this.svg.append("path")
      .data([this.points])
      .attr("d", d3.line().curve(d3.curveCardinalClosed.tension(0)));

    this.redraw();
  }

}
