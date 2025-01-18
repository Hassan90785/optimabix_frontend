import {Directive, ElementRef, Input, OnChanges} from '@angular/core';
import JsBarcode from 'jsbarcode';

@Directive({
  standalone: true,
  selector: '[appBarcode]'
})
export class BarcodeDirective implements OnChanges {
  @Input() barcodeValue!: string; // The value to encode in the barcode
  @Input() barcodeFormat = 'CODE128'; // Default format
  @Input() barcodeOptions: any = {}; // Additional JsBarcode options

  constructor(private el: ElementRef) {}

  ngOnChanges() {
    if (this.barcodeValue) {
      JsBarcode(this.el.nativeElement, this.barcodeValue, {
        format: this.barcodeFormat,
        ...this.barcodeOptions,
      });
    }
  }
}
