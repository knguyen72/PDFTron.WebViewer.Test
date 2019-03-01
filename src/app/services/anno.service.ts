
import { Injectable } from '@angular/core';


@Injectable()
export class AnnoService {

  constructor(
  ) { }

   /*
    * Register the callback function (handler) for the 'annotationChanged' event of annotation
    */
  public registerAnnotationEventHandlers(annoManager: any) {
    annoManager.on('annotationChanged', (e, annotations, action) => { this.onAnnoChanged(e, annotations, action); });

  }

  /*
    * The callback function (handler) for the 'annotationChanged' event of annotation
    */
  private onAnnoChanged(e: any, annos: any[], act: any) {
        console.log('Annotation Changed: ', e, annos, act);
        const anno = annos[0];
        if (act === 'add') {
          console.log('New Annotation added:' , anno);

        } else  if (act === 'delete') {

        } else if (act === 'modify') {

        }
  }


  async getActGoTo(action: any) {
    let doAct = await action.dest;
    console.log('Page: ', doAct.page);
    console.log('Zoom: ', await doAct.zoom);
    console.log('Name: ', await doAct.name);
  }

}
