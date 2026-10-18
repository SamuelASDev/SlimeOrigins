import Phaser from 'phaser';
import {drawJura} from './forest-art';
import {drawCavern} from './cave-art';
export class WorldScene extends Phaser.Scene {
 area:'cave'|'forest'='cave';
 mapObjects:Phaser.GameObjects.GameObject[]=[];
 drawMap(){this.mapObjects.forEach(o=>o.destroy());const old=new Set(this.children.list);if(this.area==='forest')this.drawForest();else this.drawCave();this.mapObjects=this.children.list.filter(o=>!old.has(o));}
 drawCave(){drawCavern(this);}
 drawForest(){drawJura(this);}
}
