import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MasterDimmerService {

  masterDimmerValue: number = 1;

  constructor() { }
}
