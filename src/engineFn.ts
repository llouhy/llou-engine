import { UseModelRes, useModel } from './init/useModel';
import { UseShapeRes, useShape } from './init/useShape';
import { UseGridRes, useGrid } from './init/useGrid';
import { generateRandomStr } from './config/common';
import { initContext, reloadCtxFunction } from './init/context';
import { Shape } from './shape/shape';
import type { Graphics, ModelOptions } from './graphOptions';
import type { EngineCtx, OffEngineCtx, Point } from './rewriteFn/type';
import { isString } from './utils/is';
import { getError } from './definition/error';
import { identifyMap } from './definition/identify';
import { setCanvasSize, getPureObject, mergeObjectInList, useCollectReturn, omitObjectProperty, setPropertyUnWritable } from './utils/common';
import { setIdentify } from './utils/setIdentify';
import { UseGraphRes, useGraph } from './init/useGraph';

export const isEngine = (value: any) => {
  return value === identifyMap.engine;
};

export type InitEngineResult = {
  engine: {
    width: number;
    height: number;
    id: string;
    ctx: EngineCtx;
    canvas: HTMLCanvasElement;
    readonly: boolean;
    repaintInfluencedShape: (graphics: Graphics, excludes: Set<Shape>) => void;
  };
  addModel: (modelList: ModelOptions[] | ModelOptions) => any;
  getModel: (modelName: string) => ModelOptions | undefined;
  deleteModel: (modelName: string) => boolean;
  createShape: (modelName: string, options?: { data?: any; model?: ModelOptions; index?: number }) => Shape;
  drawShape: (shape: Shape, placePoint?: Point) => string | undefined;
  getShape: (shapeId: string) => Shape | undefined;
  resizeCanvas: (w: number, h: number) => void;
  clearRect: (x: number, y: number, width: number, height: number) => void;
  [key: string]: any;
};
export type InitEngine = (options: EngineOptions) => InitEngineResult;

export type EngineOptions = {
  readonly?: boolean;
  id?: string;
  width?: number;
  height?: number;
  canvas: HTMLCanvasElement | string;
  modelList?: ModelOptions[];
};
export type CanvasIns = {
  width: number;
  height: number;
};
export type ContextAttributes = {
  alpha: boolean;
  antialias: boolean;
  depth: boolean;
  failIfMajorPerformanceCaveat: boolean;
  powerPreference: 'default' | 'high-performance' | 'low-power';
  premultipliedAlpha: boolean;
  preserveDrawingBuffer: boolean;
  stencil: boolean;
};

const DEFAULT_CANVAS_WIDTH = 300;
const DEFAULT_CANVAS_HEIGHT = 300;

export const engineById = new Map<string, InitEngineResult>();

export const initEngine: InitEngine = (options): InitEngineResult => {
  const { id, width, height, canvas, modelList, readonly } = options;
  const engineRes = engineById.get(id ?? '');
  if (engineRes) return engineRes;
  const canvasDom =
    canvas instanceof HTMLCanvasElement ? canvas : isString(canvas) && document.querySelector(`#${canvas}`);
  if (!(canvasDom instanceof HTMLCanvasElement)) {
    throw getError(`Create engine instance error: can't find a canvas dom by id ${canvas}`);
  }
  const ctx: CanvasRenderingContext2D = initContext('2d', canvasDom);
  const _id: string = id ?? generateRandomStr(8);
  const _readonly: boolean = readonly ?? false;
  const _width: number = width ?? DEFAULT_CANVAS_WIDTH;
  const _height: number = height ?? DEFAULT_CANVAS_HEIGHT;

  reloadCtxFunction(ctx as CanvasRenderingContext2D);
  setCanvasSize(canvasDom, _width, _height);
  const engineResult = getPureObject({
    engine: getPureObject({
      ctx,
      id: _id,
      width: _width,
      height: _height,
      readonly: _readonly,
      canvas: canvasDom
    })
  });
  setIdentify(engineResult, 'engine');
  engineById.set(_id, engineResult);
  const callUseResults: [UseModelRes, UseShapeRes, UseGridRes, UseGraphRes] = useCollectReturn(useModel, useShape, useGrid, useGraph)(_id);
  const funcObject = mergeObjectInList<UseModelRes & UseShapeRes & UseGridRes & UseGraphRes>(callUseResults);
  Object.assign(engineResult, funcObject);
  setPropertyUnWritable(omitObjectProperty(engineResult, ['rootGrid']), Object.keys(funcObject));
  modelList && engineResult.addModel(modelList);
  return engineResult;
};

(window as any)['dogdog'] = { initEngine };

const engine = initEngine({ canvas: 'canvas', width: 1500, height: 1500 });
// console.log(engine)
const { addModel, createShape, drawShape, getModel, engine: { ctx }, translate } = engine;
ctx.save();
ctx.strokeStyle = 'orange';
ctx.$strokeRect(0, 0, 1500, 1500);
ctx.restore();
const angleToRadian = (angle: number) => {
  return (Math.PI * angle) / 180;
};
const getTestModel1 = (): ModelOptions => {
  return {
    name: 'test1',
    draw: (ctx: EngineCtx | OffEngineCtx) => {
      ctx.save();
      // ctx.lineWidth = 10;
      ctx.strokeStyle = 'Turquoise';
      ctx.beginPath();
      ctx.moveTo(-200, -200);
      ctx.lineTo(-200, -300);
      ctx.lineTo(-100, -300);
      ctx.stroke();
      // ctx.strokeStyle = 'yellow';
      ctx.quadraticCurveTo(-322, 600, -332, -128);
      // ctx.stroke();
      ctx.bezierCurveTo(-150, -140, -188, -200, -90, -90);
      ctx.arc(-500, -500, 44, angleToRadian(45), angleToRadian(270));
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
  }
};
const getTestModel2 = (): ModelOptions => {
  return {
    name: 'test2',
    draw: (ctx: EngineCtx | OffEngineCtx): void => {
      // console.log('%c画了2', 'color: orange')
      ctx.save();
      ctx.lineWidth = 5;
      ctx.strokeStyle = 'pink';
      ctx.beginPath();
      ctx.moveTo(300, 60);
      ctx.lineTo(420, 420);
      // ctx.lineTo(420, 450);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(420, 420, 44, angleToRadian(45), angleToRadian(270));
      ctx.stroke();
      ctx.restore();
    }
    ,
    borderOptions: {
      paddingLeft: 10,
      paddingRight: 10,
      paddingTop: 20,
      paddingBottom: 20,
      borderDash: [5, 5],
      borderWidth: 2
    }
  };
};
const getTestModel3 = () => {
  return {
    name: 'test3',
    draw: (ctx: EngineCtx | OffEngineCtx) => {
      // console.log('%c画了3', 'color: blue')
      // console.log('huale333')
      ctx.save();
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'black';
      ctx.moveTo(-50, -50);
      ctx.lineTo(100, 100);
      // ctx.stroke();
      // ctx.strokeStyle = '';
      ctx.lineTo(-50, 100);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
      // ctx.putImageData()
    }
  }
}
const getTestModel4 = () => {
  return {
    name: 'test4',
    draw: (ctx: EngineCtx | OffEngineCtx) => {
      // console.log('%c画了4', 'color: red')
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(600, 430);
      ctx.lineTo(500, 500);
      ctx.bezierCurveTo(500, 500, 874, 674, 732, 434);
      ctx.arc(603, 434, 24, angleToRadian(30), angleToRadian(150));
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
  }
};
// console.log('%c22222', 'background:orange;padding:5px;')
addModel(getTestModel2());
// console.log('%c33333', 'background:orange;padding:5px;')
addModel(getTestModel3());
// console.log('%c44444', 'background:orange;padding:5px;')
addModel(getTestModel4());
// console.log('%c11111', 'background:orange;padding:5px;')
addModel(getTestModel1());
// console.log('%cend', 'background:orange;padding:5px;')
const shape1 = createShape('test1');
const shape2 = createShape('test2');
const shape4 = createShape('test4');
// console.log(shape4)
const shape3 = createShape('test3');
drawShape(shape1, { x: 300, y: 600 });
drawShape(shape2);
drawShape(shape3);
drawShape(shape4)
let idx = 0;
let id = setInterval(() => {
  // drawShape(shape, { x: idx * 3 + 50, y: idx * 3 + 50 });
  idx += 1;
  idx >= 100 && clearInterval(id)
  // idx >= 220 && ctx.translate(-100, -100);
  if (idx === 100) {
    callTranslate();
    // ctx.save();
    // ctx.strokeStyle = 'blue';
    // ctx.$strokeRect(0, 0, 1500, 1500);
    // ctx.restore();
  }

  // idx < 100 && shape3.moveTo(idx * 5 + 100, idx * 5 + 100);
  // shape4.moveTo(idx * 4 + 200, idx * 4 + 200);
}, 10);

function callTranslate() {
  let idx = 0;
  let t = {};
  const id = setInterval(() => {
    idx++;
    idx < 30 && translate(12, 12, t);
    idx >= 38 && translate(-4, -8, t);
    idx >= 60 && moveAShape() && clearInterval(id);
  }, 20);
}
function moveAShape() {
  // return 'ss'
  let idx = 0;
  let id = setInterval(() => {
    idx++;
    shape1.moveTo(idx * 3 - 20, idx * 4 - 20);
    if (idx >= 20) {
      clearInterval(id);
      moveShape2();
      ctx.save();
      ctx.strokeStyle = 'orange';
      ctx.$strokeRect(0, 0, 1500, 1500);
      ctx.restore();
    };
  }, 100);
  return true;
}
function moveShape2() {
  let idx = 0;
  let id = setInterval(() => {
    idx++;
    
    if (idx < 30) {
      shape3.moveTo(shape3.graphics.ox + 4, shape3.graphics.oy - 5);
    } else if (idx >= 30 && idx <= 60) {
      shape3.moveTo(shape3.graphics.ox + 10, shape3.graphics.oy + 12);
    } else {
      clearInterval(id);
    }
  }, 100)
}
