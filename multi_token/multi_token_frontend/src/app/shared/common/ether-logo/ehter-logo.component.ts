import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'mt-ether-logo',
  styleUrls: ['./styles.css'],
  template: `
    <img class="shapeshifter"
          src="./sprite_30fps.svg"
          [ngClass]="{play: playAnimation}"
          (mouseenter)="play()"
          (mouseleave)="stop()"
    />
  `,
})
export class EtherLogoComponent implements OnInit {

  public playAnimation = false;

  public constructor() { }

  public ngOnInit(): void { }

  public play() {
    this.playAnimation = true;
    setTimeout(() => this.playAnimation = false, 1000)
    console.log('play');
  }

  public stop() {
    // this.playAnimation = false;
    console.log('stop');
  }

}
