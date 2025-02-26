import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import OpenSeadragon from 'openseadragon';
import { createOSDAnnotator } from '@annotorious/openseadragon';
import { Annotation, AnnotoriousOpts, DrawingStyle, Filter, User} from '@annotorious/annotorious';
import { AnnotoriousContext } from '../Annotorious';

export const OpenSeadragonAnnotatorContext = createContext<{ 
  viewer: OpenSeadragon.Viewer,
  setViewer(viewer: OpenSeadragon.Viewer): void
}>({ viewer: null, setViewer: null });

export type OpenSeadragonAnnotatorProps<I extends Annotation, E extends unknown> = AnnotoriousOpts<I, E> & {

  children?: ReactNode;

  filter?: Filter<I>;

  style?: DrawingStyle | ((annotation: I) => DrawingStyle);

  tool?: string | null;

  user?: User;

}

export const OpenSeadragonAnnotator = <I extends Annotation, E extends unknown>(props: OpenSeadragonAnnotatorProps<I, E>) => {

  const { children, tool, ...opts } = props;

  const [viewer, setViewer] = useState<OpenSeadragon.Viewer>();

  const { anno, setAnno } = useContext(AnnotoriousContext);

  useEffect(() => {
    if (viewer?.element) {
      const anno = createOSDAnnotator<I, E>(viewer, opts as AnnotoriousOpts<I, E>);
      setAnno(anno);

      return () => {
        anno.destroy();
        setAnno(undefined);
      }
    }
  }, [viewer]);

  useEffect(() => {
    if (anno) anno.setDrawingEnabled(props.drawingEnabled);
  }, [anno, props.drawingEnabled]);

  useEffect(() => {
    if (anno) anno.setFilter(props.filter);
  }, [anno, props.filter]);

  useEffect(() => {

  }, [anno])

  useEffect(() => {
    if (anno) anno.setStyle(props.style);
  }, [anno, props.style]);

  useEffect(() => {
    if (anno) anno.setDrawingTool(tool);
  }, [anno, tool]);

  useEffect(() => {
    if (anno) anno.setModalSelect(props.modalSelect);
  }, [anno, props.modalSelect]);

  useEffect(() => {
    if (anno) anno.setUser(props.user);
  }, [anno, props.user]);

  useEffect(() => {
    if (anno) anno.setUserSelectAction(props.userSelectAction);
  }, [anno, props.userSelectAction]);

  return (
    <OpenSeadragonAnnotatorContext.Provider value={{ viewer, setViewer }}>
      {props.children}
    </OpenSeadragonAnnotatorContext.Provider>
  )

}

export const useViewer = () => {
  const { viewer } = useContext(OpenSeadragonAnnotatorContext);
  return viewer;
}