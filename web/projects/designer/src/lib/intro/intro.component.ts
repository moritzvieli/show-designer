import { Component, OnInit } from '@angular/core';
import { IntroService } from '../services/intro.service';
import { ConfigService } from '../services/config.service';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.css']
})
export class IntroComponent implements OnInit {

  constructor(
    public introService: IntroService
  ) { }

  ngOnInit() {
  }

  close() {
    this.introService.setShowIntro(false);
  }

}
