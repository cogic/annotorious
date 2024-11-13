import RubberbandPolygon from './RubberbandPolygon';
import EditablePolygon from './EditablePolygon';
import Tool from '../Tool';

/**
 * A rubberband selector for polygon fragments.
 */
export default class RubberbandPolygonTool extends Tool {

  constructor(g, config, env) {
    super(g, config, env);

    this._isDrawing = false;
    this._startOnSingleClick = false;
  }

  startDrawing = (x, y, startOnSingleClick) => {
    this._isDrawing = true;
    this._startOnSingleClick = startOnSingleClick;

    this.attachListeners({
      mouseMove: this.onMouseMove,
      [this.config.addPolygonPointOnMouseDown && startOnSingleClick ? 
        'mouseDown' : 'mouseUp']: this.onMouseUpDown,
      dblClick: this.onDblClick
    });
    
    this.rubberband = new RubberbandPolygon([ x, y ], this.g, this.env);
  }

  stop = () => {
    this.detachListeners();
    
    this._isDrawing = false;

    if (this.rubberband) {
      this.rubberband.destroy();
      this.rubberband = null;
    }
  }

  onMouseMove = (x, y) => {
    // Constrain the initial coordinates (x, y) to be within the image bounds
    const { naturalWidth, naturalHeight } = this.env.image;
    const constrainX = Math.min(Math.max(x, 0), naturalWidth);
    const constrainY = Math.min(Math.max(y, 0), naturalHeight);

    this.rubberband.dragTo([constrainX, constrainY]);
  }

  onMouseUp = () => {
    const { width, height } = this.rubberband.getBoundingClientRect();

    const minWidth = this.config.minSelectionWidth || 4;
    const minHeight = this.config.minSelectionHeight || 4;
    
    if (width >= minWidth || height >= minHeight) {
      this.rubberband.addPoint();
    } else if (!this._startOnSingleClick) {
      this.emit('cancel');
      this.stop();
    }
  }
  
  onMouseUpDown = () => {
    // It seems like renaming 'onMouseUp' to 'onMouseUpDown' would be appropriate.
    // However, do not do this because the 'onMouseUp' function is used in annotorious-openseadragon.
    this.onMouseUp();
  }

  onDblClick = () => {
    if (this.rubberband.points.length < (this.config.minPolygonPoints || 0)) return;

    this._isDrawing = false;

    const shape = this.rubberband.element;
    shape.annotation = this.rubberband.toSelection();
    this.emit('complete', shape);

    this.stop();
  }

  get isDrawing() {
    return this._isDrawing;
  }

  createEditableShape = (annotation, formatters) =>
    new EditablePolygon(annotation, this.g, {...this.config, formatters}, this.env);

}

RubberbandPolygonTool.identifier = 'polygon';

RubberbandPolygonTool.supports = annotation => {
  const selector = annotation.selector('SvgSelector');
  if (selector)
    return selector.value?.match(/^<svg.*<polygon/g);
}