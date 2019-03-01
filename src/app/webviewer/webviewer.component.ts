import { Component, ViewChild, ElementRef,
  AfterViewInit, OnInit, NgZone, EventEmitter } from '@angular/core';
import { WebviewerService } from '../services/webviewer.service';

declare var PDFTron: any;
declare var CoreControls: any;

@Component({
  selector: 'app-webviewer',
  templateUrl: './webviewer.component.html',
  styleUrls: ['./webviewer.component.css']
})
export class WebViewerComponent implements OnInit, AfterViewInit {

  @ViewChild('viewer') viewer: ElementRef;
  myWebViewer: any;
  pdfTronKey = 'demo:knguyen72@dxc.com:75b57e3d01126111fac2ab175faa5eb2d14826ed668c20b9e7';

  public docLoadedEvent: EventEmitter<number> = new EventEmitter<number>();

  vlmInitAlready = false;
  constructor(private zone: NgZone,
    public viewerService: WebviewerService) {

  }

  ngOnInit() {
    window['viewer'] = {
      zone: this.zone,
      component: this
    };
  }

  ngAfterViewInit(): void {
    console.log('Start loading document ...: ' + this.getCurrentTime());
    this.myWebViewer = new PDFTron.WebViewer({
      type: 'html5',
      path: '/assets/lib',
      // l: this.pdfTronKey,
      initialDoc: '/assets/docs/test-empty.docx',
      config: '/assets/config.js',
      workerTransportPromise: this.getWorkerPromise(this.pdfTronKey),
      preloadPDFWorker: false,
      showLocalFilePicker: true,
      enableAnnotations: true,
      // pdftronServer: 'http://localhost:8090/',
      fullAPI: true
    }, this.viewer.nativeElement);

    // this.myPDFNet = this.getWindow().PDFNet;
    // this.viewer.nativeElement.querySelector('iframe').contentWindow.addEventListener('message', function(event) {
    //   // console.log(event.data);
    //   if (event.data === 'PDFNetLoaded') {
    //     const datetime: Date = new Date();
    //     const text: string = datetime.getHours().toString() + ':' +
    //     datetime.getMinutes().toString() + ':' +
    //     datetime.getSeconds().toString() + '.' +
    //     datetime.getMilliseconds().toString();
    //     console.log('Document Loaded completed at: ' + text, datetime);


    //     window['viewer'].zone.run(function() {

    //       // window['viewer'].component.logTreeBm();
    //       // window['viewer'].component.insertBM(1000);
    //       // window['viewer'].component.getFirstBm();
    //     });
    //   }
    //   // console.log(event);

    // });
    // console.log('This is the iframe: ', this.viewer.nativeElement.querySelector('iframe'));
  }

  getWorkerPromise(pdfTronKey: string): any {
    // create the worker backend so we don't need to always create a new backend.
    CoreControls.setWorkerPath('/assets/lib/core');
      CoreControls.enableFullPDF(true);
      let worker = CoreControls.getDefaultBackendType().then((backend) => {
        // let initPDFTransports = CoreControls.initPDFWorkerTransports(backend, {}, pdfTronKey);
        // return initPDFTransports;
        let office = CoreControls.initOfficeWorkerTransports(backend, {}, pdfTronKey);
        return office;
      });
    return worker;
  }

  getPDFnet() {
    return  this.getWindow().PDFNet;
  }

  getWebViewer(): any {
    return this.myWebViewer;
  }

  getIframe() {
    return this.viewer.nativeElement.querySelector('iframe');
  }

  getWindow(): any {
    return this.viewer.nativeElement.querySelector('iframe').contentWindow;
  }

  getElement(): any {
   return (this.viewer.nativeElement);
  }

  public  getCurrentTime(): string {

    const datetime: Date = new Date();
    const text: string = datetime.getHours().toString() + ':' +
    datetime.getMinutes().toString() + ':' +
    datetime.getSeconds().toString() + '.' +
    datetime.getMilliseconds().toString();

    return text;

  }
}

