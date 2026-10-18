import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fresh,migrate,addItem} from '../src/model.ts';
import {marketOffers,purchaseOffer,remainingStock,restockRemaining,MARKET_INTERVAL} from '../src/market.ts';
import {sellItem} from '../src/economy.ts';
import {gearBonuses} from '../src/equipment.ts';
import {readMarket} from '../src/market-state.ts';
test('caravana oferece estoque estável no ciclo e renova no limite de 15 minutos',()=>{
 const s=fresh(),first=marketOffers(s,0);assert.deepEqual(marketOffers(s,MARKET_INTERVAL-1),first);assert.equal(restockRemaining(s,0),MARKET_INTERVAL);assert.equal(restockRemaining(s,MARKET_INTERVAL-1),1);
 const second=marketOffers(s,MARKET_INTERVAL);assert.notDeepEqual(second,first);assert.equal(s.market.cycle,1);assert.equal(restockRemaining(s,MARKET_INTERVAL),MARKET_INTERVAL);
});
test('quantidades esgotam, persistem no save e não renovam ao recarregar',()=>{
 const s=fresh();s.coins=10000;s.village.founded=true;const offer=marketOffers(s,0).find(o=>o.kind==='skill')!;
 for(let i=0;i<offer.stock;i++)assert.equal(purchaseOffer(s,offer.id,true,0).ok,true);
 assert.equal(remainingStock(s,offer),0);const before=JSON.stringify(s);assert.equal(purchaseOffer(s,offer.id,true,0).ok,false);assert.equal(JSON.stringify(s),before);
 const loaded=migrate(JSON.parse(JSON.stringify(s)));assert.equal(remainingStock(loaded,marketOffers(loaded,300)[0]),0);assert.deepEqual(loaded,s);
 const renewed=marketOffers(loaded,MARKET_INTERVAL);assert.equal(remainingStock(loaded,renewed[0]),renewed[0].stock);assert.equal(purchaseOffer(loaded,offer.id,true,MARKET_INTERVAL).ok,false);
});
test('relógio regressivo não retorna estoque consumido nem muda ofertas',()=>{
 const s=fresh();s.village.founded=true;s.coins=1000;const offers=marketOffers(s,MARKET_INTERVAL*4);purchaseOffer(s,offers[0].id,true,MARKET_INTERVAL*4);
 assert.deepEqual(marketOffers(s,0),offers);assert.equal(s.market.purchased[offers[0].id],1);
});
test('compras e vendas são bloqueadas fora da vila sem alteração de saldo ou itens',()=>{
 const s=fresh();s.village.founded=true;s.coins=1000;const item=addItem(s,'beetle');const offer=marketOffers(s,0)[0],before=JSON.stringify(s);
 assert.equal(purchaseOffer(s,offer.id,false,0).ok,false);assert.equal(sellItem(s,'skill',item.uid,false).ok,false);assert.equal(sellItem(s,'skill',item.uid).ok,false);assert.equal(JSON.stringify(s),before);
});
test('equipamentos comprados ficam na mochila e não concedem bônus sem equipar',()=>{
 const s=fresh();s.village.founded=true;s.coins=10000;const offer=marketOffers(s,0).find(o=>o.kind==='gear')!;
 assert.equal(purchaseOffer(s,offer.id,true,0).ok,true);assert.equal(s.equipment.items.length,1);assert.equal(s.equipment.items[0].origin,'merchant');assert.deepEqual(gearBonuses(s),{attack:0,defense:0,haste:0,regen:0});
});
test('leitura de estoque rejeita chaves e quantidades inválidas',()=>{
 assert.deepEqual(readMarket(null),{cycle:-1,purchased:{}});
 const read=readMarket({cycle:3,purchased:{'3:rune-0':2,'3:gear-0':NaN,'3:material-ore':-4,'unknown':3}});assert.deepEqual(read,{cycle:3,purchased:{'3:rune-0':2}});
});
