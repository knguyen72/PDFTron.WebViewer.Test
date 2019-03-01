// $.extend(ReaderControl.config, { serverURL: null });

window.rotatePages = function() {
  readerControl.rotateCounterClockwise();
};



(function () {
  $(document).on('documentLoaded', function () {
    /*
    PDFNet.initialize().then(function(){
      window.postMessage('PDFNetLoaded', '*');
      console.log('DocumentLoaded OK');
      
      
      console.log(parent);
      console.log(window);

      // ---
      var doc = readerControl.docViewer.getDocument();
      doc.getPDFDoc().then(function(pdfDoc) {
        // Ensure that we have our first page.
        pdfDoc.requirePage(1).then(function() {
          // Run our script
          runCustomViewerCode(pdfDoc).then(function(){
            // Refresh the cache with the newly updated document
            readerControl.docViewer.refreshAll();
            // Update viewer with new document
            readerControl.docViewer.updateView();
          });
        });
      });

      var runCustomViewerCode = function(doc) {
        function* maindon() {

          alert("Hello WebViewer!");
        }
        return PDFNet.runGeneratorWithCleanup(maindon());
      }
    

    });
     */

      // hide a element
     //$('#zoomIn').hide();
    

     //bind a click handler on the click action
     $('#zoomIn').bind('click', function() {
      // document finished loading
      //$.alert('hoho', 'About ReaderControl');
      
    });

    //$.alert('hoho', 'About ReaderControl');

    //disable click event
    //$('#zoomIn').css("pointer-events", "none");
     
  });
})();
