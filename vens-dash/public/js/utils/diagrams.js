/** class to render and control diagrams
 * @param {string} prefix identifies the set of diagram
 */
const Diagrams = (prefix) => {

    const nameFile = idx => prefix + '-' + idx;
    const diagramId = idx => `ctr-diag-${prefix}-${idx}`;
    const uploadClass = "diagramUploader";
    const imgClass = "diagram-img";

    /** creates a control to upload and display a diagram */ 
    const create = async idx => {
        const attrs = await fetchDiagramAttrs(idx);
        return $(`<div id="${diagramId(idx)}">`)
            .append(diagramImg(idx, attrs))
            .append(diagramForm(idx));
    };

    /** fetches img src url and max-width */
    const fetchDiagramAttrs = idx => {
        return fetch('/diagram/'+nameFile(idx))
            .then( res => res.json() )
            .catch( err => console.error(err) );
    };

    /** generates diagram img */
    const diagramImg = (idx, attrs) => {
        return $(`<div class="${imgClass} collapse">
            <img src="${attrs.src}" style="${attrs.style}"></img>
        </div>`);
    };
    /** generates the form to upload the diagram */
    const diagramForm = idx => {
        return $(`<div class="container ${editModeClass()}" style="margin-bottom:48px;">
            <hr>
            <h5> Change diagram </h5>
            <div class="form-group">
                <label>Load diagram picture</label>
                <input type="file" accept="image/*" name="diagram"
                    class="form-control-file" required
                >
                <br>
                <button class="${uploadClass} btn btn-primary">
                    Upload
                </button>
            </div>
        </div>`).on('click',
            event => onFormClick(event,idx)
        );
    };

    /**  checks upload validity */
    const onFormClick = (event, idx) => {
        const $target = $(event.target);
        if ($target.hasClass(uploadClass)){
            const files = $target.parent().find('input[type="file"]')[0].files;
            const url = '/diagram/' + nameFile(idx);
            if (files.length){  
                handleUpload( url, files[0] );
            } else {
                alert('No file selected. Please select an image to upload.');
            }
        }
    };

    /** uploads of file to url  */
    const handleUpload = (url, file) => {
        const formData = new FormData();
        formData.append('diagram', file);
        fetch(url, {
            method: 'PUT',
            body: formData
        })
        .then(response => response.json())
        .then(result => {
            console.log('Success:', result);
            onUploadSuccess(url);
        });
    };

    /** update image when the upload has been confirmed */
    const onUploadSuccess = async url => {
        const idx = url.split('-').pop();
        cleanInputFile(idx);
        await refreshImg(idx);
        showImgs();
    };

    /** after upload resets input */
    const cleanInputFile = idx => {
        $img = $('#'+diagramId(idx))
        .find('input[type="file"]')
        .val('');
    };

    /** refresh the image */
    const refreshImg = async idx => {
        const attrs = await fetchDiagramAttrs(idx);  
        attrs.src = attrs.src + "?v=" + new Date().getTime();
        const $div = $('#' + diagramId(idx));
        $div.find('.' + imgClass).remove();
        $div.prepend(diagramImg(idx, attrs));
        await $ready();
    };

    /** set diagrams to visible */
    const showImgs = () => {
        $("."+imgClass).collapse('show');
    };

    return { create };
};