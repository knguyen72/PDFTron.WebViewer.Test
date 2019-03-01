import { Component, ViewChild, AfterViewInit, OnInit, NgZone } from '@angular/core';
import { WebViewerComponent } from './webviewer/webviewer.component';
import { HttpClient } from '@angular/common/http';
import { WebviewerService } from './services/webviewer.service';
import { AnnoService } from './services/anno.service';


export class AnnoExportOption {
  annotList: any;
  fields = true;
  widgets = true;
  links = true;
}

// declare var $: any;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit, OnInit {
  @ViewChild(WebViewerComponent) private webviewerComponent: WebViewerComponent;

  constructor(private zone: NgZone,
    public http: HttpClient,
    private annoService: AnnoService,
    private webView: WebviewerService) {
  }

  ngOnInit() {
    window['app-root'] = {
      zone: this.zone,
      component: this
    };
  }
  ngAfterViewInit() {
    // this.listenToPageChange();
  }

  // shows how to listen to an event on the viewer element
  listenToPageChange(): void {
    this.webviewerComponent.getElement().on('pageChanged', function(e, pageNumber) {
      console.log('Current page is', pageNumber);
    });
  }


  listenToDocDblClick(): void {
    this.getDocumentViewer().on('dblClick', function(e, natEvent) {

      console.log('Double Clicked [event, NativeEvent] = ');
      console.log(natEvent);
      window['viewer'].zone.run(function() {
        window['viewer'].component.viewerService.processEvent(window['viewer'].component, 1, natEvent.offsetX, natEvent.offsetY);
      });
    });
  }

  listenToMoseMove(): void {
    this.getDocumentViewer().on('mouseMove', function(e, natEvent) {

      // console.log('Mouse moving [event, NativeEvent] = ');
      // console.log(natEvent);
      window['viewer'].zone.run(function() {
        window['viewer'].component.viewerService.processEvent(window['viewer'].component, 2, natEvent.offsetX, natEvent.offsetY);
      });
    });

  }
  getReaderControl(): any {
    return this.webviewerComponent.getWebViewer().getInstance();
  }


  getDocumentViewer(): any {
    return this.webviewerComponent.getWebViewer().getInstance().docViewer;
  }

  // shows how to call a function on WebViewer instance
  loadDocument(): void {
    this.webviewerComponent.getWebViewer().loadDocument('../assets/docs/bigFile3.pdf');
  }

  async getFirstBookmarkClick() {
    if (!this.webviewerComponent.vlmInitAlready) {
      this.showDialog('INIT VLM FIRST');
      return;
    }
   let pdfNet =  this.webviewerComponent.getPDFnet();
   let title = await this.getFirstBM();
   this.showDialog(title);
  }

  async getFirstBM() {
    let rs = '';
    const readerControl = this.getReaderControl();
    const doc = readerControl.docViewer.getDocument();
    const pdfDoc = await doc.getPDFDoc();
    // Ensure that we have our first page.
    pdfDoc.requirePage(1);
      // Run our script
    console.log('require page 1');
    pdfDoc.initSecurityHandler();
    console.log(pdfDoc);
    pdfDoc.lock();
    const allBm = '';
    const fbm = await pdfDoc.getFirstBookmark();
    if (fbm) {
        rs = await fbm.getTitle();
    }
    return rs;
  }

  getbookmarks(bmObj: any): string {
    let rs = '';
    if (bmObj) {
      bmObj.getTitle().then(function(szTitle) {
          rs = rs + ' ' + szTitle;
          bmObj.getNext().then(function(nbm) {
            rs = rs + this.getbookmarks(nbm);
          });
      });
    }
    return rs;
  }

  showDialog(msg: string) {
    alert(msg);
  }

  // shows how to call functions on APIs defined in the WebViewer iframe
  addAnnotation(): void {
    const viewerWindow = this.webviewerComponent.getWindow();

    const annotManager = this.getReaderControl().docViewer.getAnnotationManager();
    /*
    const rectangle = new viewerWindow.Annotations.RectangleAnnotation();
    rectangle.PageNumber = 1;
    rectangle.X = 100;
    rectangle.Y = 100;
    rectangle.Width = 250;
    rectangle.Height = 250;
    rectangle.Author = annotManager.getCurrentUser();
    annotManager.addAnnotation(rectangle);
    annotManager.drawAnnotations(rectangle.PageNumber);
    */

   if (!this.webviewerComponent.vlmInitAlready) {
    this.showDialog('INIT VLM FIRST');
    return;
  }
    this.webviewerComponent.viewerService.test(this.webviewerComponent);
  }

  // shows how to call a function that was defined in config.js
  rotatePages(): void {
    const viewerWindow = this.webviewerComponent.getWindow();
    viewerWindow.rotatePages();
  }
  async initLinkManager() {

    let pdfNet  = this.webviewerComponent.getPDFnet();
    await pdfNet.initialize();

    let viewerWindow = this.webviewerComponent.getWindow();
    let doc = this.getReaderControl().docViewer.getDocument();
    let pdfDoc = await doc.getPDFDoc();
    // pdfDoc.unlock();
    await pdfDoc.requirePage(1);
    // Run our script
    pdfDoc.initSecurityHandler();
    let page1 = await pdfDoc.getPage(1);

    let annos = await page1.getAnnots();
    this.listenToDocDblClick();
    this.listenToMoseMove();

    this.annoService.registerAnnotationEventHandlers(this.getDocumentViewer().getAnnotationManager());


    this.webviewerComponent.vlmInitAlready = true;

    this.webView.test(this.webviewerComponent); // High level
    this.webView.getLinkAnnots(pdfDoc, pdfNet); // Low level
  }

  async drawRect() {
    if (!this.webviewerComponent.vlmInitAlready) {
      this.showDialog('INIT VLM FIRST');
      return;
    }
    this.webviewerComponent.viewerService.drawRectWithParam(this.webviewerComponent, 20, 200, 40, 50, true);
  }

  async inserBookmark() {
    if (!this.webviewerComponent.vlmInitAlready) {
      this.showDialog('INIT VLM FIRST');
      return;
    }
    console.log('This is the iframe: ', this.webviewerComponent.getIframe());
    console.log('This is the iframe contentWindow: ', this.webviewerComponent.getIframe().contentWindow);
    console.log('This is the iframe contentDocument: ', this.webviewerComponent.getIframe().contentDocument);
    console.log('This is PDFNet: ', this.webviewerComponent.getPDFnet());

    // this.viewerService.insertBM(this.webviewerComponent, 1);
  }
  private async mergeVirtualAnno(pdfNet: any, pdfDoc: any) {
    const base64str = ''; // await this.getFDFBuf();
    const binary_string = ''; // window.atob(base64str);
    console.log('FDF Binary Data: ', binary_string);
    try {
      const filter = await pdfNet.Filter.createMemoryFilter(binary_string.length * 2, true);
      const writer = await pdfNet.FilterWriter.create(filter);
      writer.writeString(binary_string);
      writer.flushAll();
      // let dummyFdfDoc = await pdfNet.FDFDoc.create();
      const fdfDoc = await pdfNet.FDFDoc.createFromStream(filter);

      // let annoBuf  = await fdfDoc.saveMemoryBuffer();
      // console.log('Virual annot buf: ', annoBuf);

      await pdfDoc.fdfMerge(fdfDoc);

      // this.refreshAnnots(pdfDoc);
      pdfDoc.flattenAnnotations();

      this.getReaderControl().refreshAnnotControls();

      this.getReaderControl().docViewer.refreshAll();
      // update viewer with new document
      this.getReaderControl().docViewer.updateView();
      // Annotations may contain text so we need to regenerate
      // our text representation
      this.getReaderControl().docViewer.getDocument().refreshTextData();
    } catch (error) {
        console.log('Error: ', error);
    }
  }

  private async mergeVirtualAnnoXml() {
    const fdfXml = await this.getFDFXml();
    console.log('FDF Xml: ', fdfXml);
    const annoManager = this.getReaderControl().docViewer.getAnnotationManager();
    annoManager.importAnnotations(fdfXml);
  }
  private async printAnnoBinary( pdfDoc: any) {
    const fdfDoc = await pdfDoc.fdfExtract(1);
    const annoBuf  = await fdfDoc.saveMemoryBuffer(); // Uint8Array
    const fdfBinStr = this.ab2str(annoBuf);
    console.log('FDF Bin String: ', fdfBinStr);
  }

  private async printAnnoXml( pdfDoc: any) {
    const fdfDoc = await pdfDoc.fdfExtract(1);
    const annoXml  = await fdfDoc.saveAsXFDFAsString();
    console.log('FDF Xml: ', annoXml);
  }

  private ab2str(buf: any): string {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
  }


  getFDFBuf() {
    return new Promise(resolve => {
    this.http.get('http://localhost:54409/api/values/1').subscribe(
      data => {resolve(data); },
      err => {
        console.log(err);
      });
    });
  }

  getFDFXml() {
    return new Promise(resolve => {
    this.http.get('http://localhost:54409/api/values').subscribe(
      data => {resolve(data); },
      err => {
        console.log(err);
      });
    });
  }
}

