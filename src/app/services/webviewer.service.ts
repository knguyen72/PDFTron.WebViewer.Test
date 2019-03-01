
import { Injectable } from '@angular/core';
import { AnnoService } from './anno.service';


@Injectable()
export class WebviewerService {

  constructor(
    private annoService: AnnoService
  ) { }

  processEvent(vieweCom: any, id: number, x: number, y: number) {
    if (id === 1) {
      const msg = 'Double click at: ' + x.toString() + ',' + y.toString();
      alert('Fire Event: ' + msg);
    } else if (id === 2) {
      if (this.inRectangle(x, y, 20, 200, 40, 50)) {
        // this.drawRectWithParam(vieweCom, 20, 200, 40, 50, false);
      }
    }
  }

  async logTreeBm(vieweCom: any) {
    const pdfNet  = await vieweCom.getPDFnet();
    console.log(pdfNet);
    const readerCtrl = vieweCom.getWebViewer().getInstance();
    const document = readerCtrl.docViewer.getDocument();

    // get PDF doc
    const doc = await document.getPDFDoc();
    doc.initSecurityHandler();
    doc.lock();

    const root = await doc.getFirstBookmark();
    await this.printOutlineTree(root, pdfNet);
    doc.unlock();
    alert('Bookmark tree builded finish! ');
  }

  async addIndent(item, str) {
    const ident = (await item.getIndent()) - 1;
    for (let i = 0; i < ident; ++i) {
      str += '  ';
      // note: must manually set IndentString to empty after this function is called.
    }
    return str;
  }

  async printOutlineTree(item, pdfNet) {
    for (; item != null; item = await item.getNext()) {
      let IndentString = '';
      let ActionString = '';
      let TitleString = '';

      IndentString = await this.addIndent(item, IndentString);
      TitleString = await item.getTitle();

      ActionString = (IndentString + (await item.isOpen()) ? '- ' : '+ ') + TitleString + ' Action -> ';

      const action = await item.getAction();
      if (await action.isValid()) {
        const actionType = await action.getType();
        if (actionType === pdfNet.Action.Type.e_GoTo) {
          const dest = await action.getDest();
          if (await dest.isValid()) {
            const page = await dest.getPage();
            console.log(ActionString + 'GoTo Page # ' + (await page.getIndex()));
          }
        } else {
          console.log(ActionString + 'Not a GoTo action');
        }
      } else {
        console.log(ActionString + 'NULL');
      }

      if (await item.hasChildren()) {
        await this.printOutlineTree(await item.getFirstChild(), pdfNet);
      }
    }
  }

  inRectangle(pX: number, pY: number, x: number, y: number,
    high: number, width: number ): boolean {
      let rs = false;
      if (pX >= x ) {
        if (pX <= x + width) {
          if (pY >= y) {
            if (pY <= y + width) {
              rs = true;
            }
          }
        }
      }

      return rs;
  }
  async  drawRectWithParam(vieweCom: any, x: number, y: number,
        high: number, width: number, isRed: boolean) {
          console.log('Draw rect');
    if (!vieweCom.vlmInitAlready) {
      alert('Not yet start Link Manager!');
      return;
    }
    const pdfNet  = await vieweCom.getPDFnet();
    const readerCtrl = vieweCom.getWebViewer().getInstance();
    const document = readerCtrl.docViewer.getDocument();
    // get PDF doc
    const doc = await document.getPDFDoc();
    doc.requirePage(1);
    doc.initSecurityHandler();
    doc.lock();
    // In WebViewer programs, file searching starts from the WebViewer/lib/html5 folder
    const firstPage =  await doc.getPage(1);
    // create a new page builder that allows us to create new page elements
    const builder = await pdfNet.ElementBuilder.create();
    // create a new page writer that allows us to add/change page elements
    const writer = await pdfNet.ElementWriter.create();
    writer.beginOnPage(firstPage, pdfNet.ElementWriter.WriteMode.e_overlay);
    // Draw a rectangle
    const dash = true;
    builder.pathBegin();
    builder.moveTo(x, y);
    builder.lineTo(x, y + high);
    builder.lineTo(x + width, y + high);
    builder.lineTo(x + width, y);
    builder.lineTo(x, y);
    const element = await builder.pathEnd();
    // Set the path color space and color
    // this path is should be filled
    element.setPathFill(true);
    element.setPathClip(false);
    const gstate = await element.getGState();
    gstate.setFillColorSpace(await pdfNet.ColorSpace.createDeviceRGB());
    gstate.setFillColorWithColorPt(await pdfNet.ColorPt.init(1, 1, 1)); // white Circle
    gstate.setStrokeColorSpace(await pdfNet.ColorSpace.createDeviceRGB());
    if (isRed) {
      gstate.setStrokeColorWithColorPt(await pdfNet.ColorPt.init(1, 0, 0)); // Red Circle
    } else {
      gstate.setStrokeColorWithColorPt(await pdfNet.ColorPt.init(0, 1, 0)); // Red Circle
    }
    element.setPathStroke(true);        // this path is should be stroked

    if (dash) {
      const dash_pattern = [];
      dash_pattern.push(3);
      dash_pattern.push(2);
      // gstate.setDashPattern(dash_pattern, 0);
    }
    writer.writeElement(element);
    writer.end();
    doc.unlock();
    readerCtrl.docViewer.refreshAll();
    // Update viewer with new document
    readerCtrl.docViewer.updateView();
  }
  async findBm(title, item, pdfNet) {
    let rs ;
    for (; item != null; item = await item.getNext()) {
      const bmTitle: string = await item.getTitle();
      if (bmTitle.startsWith(title)) {
          rs = item;
          return rs;
      } else {
          if (await item.hasChildren()) {
            rs = this.findBm(title, await item.getFirstChild(), pdfNet);
          }
      }
    }
    return rs;
    }


    async insertBM(vieweCom: any, pagenum: number) {
    const pdfNet  = await vieweCom.getPDFnet();
    console.log(pdfNet);
    const readerCtrl = vieweCom.getWebViewer().getInstance();
    const document = readerCtrl.docViewer.getDocument();

    // get PDF doc
    const doc = await document.getPDFDoc();
    doc.initSecurityHandler();
    doc.lock();

    const root = await doc.getFirstBookmark();
    const bm = await this.findBm('Part1', root, pdfNet);

    if (bm === undefined) {
      console.log('The BookMark found NONE ');
    } else {
      console.log('The BookMark found: ' + (await bm.getTitle()));
      console.log(bm);
      await bm.addNewNext('VirutalBM');
      const newBm = await pdfNet.Bookmark.create(doc, 'vtBM' );
      await bm.addChild(newBm);
    }
    readerCtrl.docViewer.refreshAll();
    // Update viewer with new document
    readerCtrl.docViewer.updateView();

    doc.unlock();
    alert('Bookmark tree builded finish! ');
  }

   /*
    * Check whether the Annotations.Annotation provided is a actual link or not
    */
   isActualLink(annoLink: any, viewerCom: any): boolean  {
    let rs = false;
    let cusVal = annoLink.getCustom();
    if (cusVal === undefined || cusVal === null) {
        if (annoLink instanceof viewerCom.getWindow().Annotations.Link) {
            rs = true;
        }
    }
    return rs;
  }

  /*
    * Get all virtual Annotations.Link in current active WebViewer
    * Return: a list of virtual Annotations.Link
    */
   getAllActualLinks(viewerCom: any): any[] {
    let list: any[] = [];
    let annoManager = viewerCom.getWebViewer().getInstance().docViewer.getAnnotationManager();
    const annos = annoManager.getAnnotationsList();
    annos.forEach(anno => {
      if (anno instanceof viewerCom.getWindow().Annotations.Link) {
        if (this.isActualLink(anno, viewerCom)) {
            list.push(anno);
        }
      }
    });
    return list;
  }

  public async getLinkAnnots(pdfDoc: any, pdfNet: any): Promise<any[]> {
    console.log('-----LOW LEVEL-----');
    let hyperlinkInfoArray = [];
    let firstPage = 1;
    let lastPage = 1;

    for (let index = firstPage; index <= lastPage; index++) {
        let page = await pdfDoc.getPage(index);
        let annotCount = await page.getNumAnnots();

        let annot = await page.getAnnot(0);
        if (annot != null) {
          // console.log('annot.getType() = ', await annot.getType());
          // console.log('pdfNet.Annot.Type.e_Link = ', pdfNet.Annot.Type.e_Link);
          // console.log('LinkAnnot.Rect: ', annot.getRect());
          let annotRect = await annot.getRect();
          console.log('LinkAnnot.Rect: ', annotRect);
        }
    }

    return hyperlinkInfoArray;
  }


  async test(vieweCom: any) {
    console.log('-----HIGH LEVEL-----');
    let virLinks = this.getAllActualLinks(vieweCom);
    // sort base on pageNum of annotations
    virLinks = virLinks.sort((a, b) => 0 - (a.PageNumber > b.PageNumber ? -1 : 1));

    let iPage = -1;
    for (let iAnnot = 0; iAnnot < virLinks.length; iAnnot++) {
        if (iPage !== virLinks[iAnnot].PageNumber) {
            // update Dlg message when moving on new page
            iPage = virLinks[iAnnot].PageNumber;
            // TODO: set cursor = iPage of progress bar
        }
        let linkAno = virLinks[iAnnot];
        // console.log('Annotations.Link ' + iAnnot + ': ', linkAno);
        // console.log('Annotations.Link.Rect = ', linkAno.getRect());
        let linkAnoRect = await linkAno.getRect();
        console.log('Annotations.Link.Rect = ', linkAnoRect);

        // FOR ACTION
        /*
        let actions = linkAno.getActions();
        let action;
        if (actions.U && actions.U.length > 0 ) {
          action = actions.U[0];
        }

        let actiontype = 4; // none
        if (action) {
          if (action instanceof vieweCom.getWindow().Actions.GoTo) {
            console.log('GoTo Link: ', linkAno);
            console.log('GoTo Action: ', action);
            await this.annoService.getActGoTo(action);
          } else if (action instanceof vieweCom.getWindow().Actions.GoToR) {
            console.log('GoToR Link: ', linkAno);
            console.log('GoToR Action: ', action);

          } else if (action instanceof vieweCom.getWindow().Actions.URI) {
            console.log('URI Link: ', linkAno);
            console.log('URI Action: ', action);
          }
        } else {
          console.log('None Link: ', actions);
        }
*/
        // console.log('Anno: ', linkAno);
        // console.log('Action of anno: ' + iAnnot.toString(), actions);





    }

    let pdfNet  =  vieweCom.getPDFnet();
    let readerCtrl = vieweCom.getWebViewer().getInstance();
    let document = readerCtrl.docViewer.getDocument();
    let pdfDoc = await document.getPDFDoc();
    pdfDoc.initSecurityHandler();
    // await this.getLinkAnnots(pdfDoc, pdfNet);
  }

  async printObjDict(cosObject: any) {
    let dic = await cosObject.getDictIterator();
    while (await dic.hasNext()) {
        let key = await dic.key(); // Obj
        let val = await dic.value(); // Obj
        let name: string = await key.getName();
        // let valStr: string =  await val.getAsPDFText();

        // name === 'ISI:APPNAME'
        console.log('------------------------');
        console.log('Key Name: ', name);
        console.log('Val Obj: ', val);
        // console.log('Val Text: ', valStr);

        await dic.next();
    }

  }


}


