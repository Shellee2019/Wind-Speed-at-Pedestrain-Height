drop database wind;

create database wind COLLATE utf8_general_ci;

use wind;

create table stations(
  id int primary key auto_increment,
  stationId varchar(30) not null unique,
  stationName varchar(30) not null,
  x float not null,
  y float not null,
  amsl TINYINT not null,
  type varchar(10) not null,
  a float not null,
  z0 float not null
);

create table observations(
  id int primary key auto_increment,
  wind float default null,
  time timestamp,
  station_id varchar(30) not null
--   constraint belongs_to_stations_fk  foreign key (station_id) references stations(stationId) on delete cascade
);
create table idw (
	id int primary key AUTO_INCREMENT,
	gid int not null,
	u100 float not null,
	grid geometry not null,
	time timestamp
);

drop table idw;
create table idw (
	id int primary key AUTO_INCREMENT,
	gid int not null,
	u100 float not null,
	grid geometry not null,
	time timestamp
);

drop table idw;
select count(*) from idw;

drop table z0;
create table z0 (
	id int primary key AUTO_INCREMENT,
	value float,
	grid geometry not null,
	SPATIAL INDEX(grid)
);

DESCRIBE z0;
ALTER TABLE z0 ADD SPATIAL INDEX(grid);

drop table temp2;
create table temp2 (
	id int,
	value float,
	grid text
);
select count(*) from temp2;

insert into z0(id, value, grid) select id, value, ST_GeomFromText(grid) from temp;

select count(*) from temp;



select count(*) from z0;

select count(*) from z0;
select * from z0;
delete from z0;


select
	ST_AsGeojson(grid) as geometry,
    gid,
    u100,
    time
from idw;

select x, y from stations;
select * from stations where stationId = '古亭';
select * from observations;

select s.stationId, s.stationName, s.x, s.y, s.type, s.amsl, o.wind, MAX(o.time) as time from stations as s LEFT JOIN observations as o ON s.stationId = o.station_id group by stationId;
-- 抓出所有測站名單內最新一筆近10分鐘的風速監測數據
select s.stationId, s.stationName, s.x, s.y, s.type, s.amsl, s.a, s.z0, o.wind, MAX(o.time) as time from stations as s LEFT JOIN observations as o ON s.stationId = o.station_id and o.time > CURRENT_TIMESTAMP - INTERVAL 90 MINUTE group by stationId;
select s.stationId, s.stationName, s.x, s.y, s.type, s.amsl, s.a, s.z0, o.wind, MAX(o.time) as time from stations as s LEFT JOIN observations as o ON s.stationId = o.station_id and o.time > DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 90 MINUTE) group by stationId;
select * from stations as s left outer JOIN observations as o ON s.stationId = o.station_id where o.wind is not null ORDER BY o.time desc;
select * from stations as s left outer JOIN observations as o ON s.stationId = o.station_id where o.wind is not null group by s.stationName ORDER BY o.time desc;

select * from stations;

select * from stations, observations where stations.stationId = observations.station_id;

select * from stations, observations where stations.stationId = observations.station_id and time > CURRENT_TIMESTAMP - INTERVAL 10 MINUTE order by time asc;

-- select CURRENT_TIMESTAMP - DATE_FORMAT;
delete from observations;
select CURRENT_TIMESTAMP - INTERVAL 10 MINUTE;
select * from observations order by time desc;
select * from stations;
select * from observations where time > CURRENT_TIMESTAMP - INTERVAL 20 MINUTE;

insert into 
	wind.observations (wind, time, station_id) 
VALUES
(10,'2019-11-09 13:50:34', '古亭'),
(20, '2019-11-09 13:51:34','中山'),
(60, '2019-11-09 13:41:34', '大同'),
(18, '2019-11-09 13:43:34', '萬華'),
(23, '2019-11-09 13:49:34','松山');

select EXISTS (select * from observations where time = '2019-11-09 15:00:00' and station_id = 'C0K550')

insert into 
	wind.observations (wind, time, station_id)
VALUES 
	(10,'2019-11-09 13:50:34', '古亭')
WHERE NOT EXISTS
(select 1 from observations where time = '2019-11-09 13:50:34' and station_id = '古亭');


-- 1.測站存在 2. 該時間的監測資料不存在
-- 符合上述兩個條件才進行新增資料 
select 10,'2019-11-09 13:50:34', '古亭' from observations o where EXISTS (select * from stations s where s.stationId = o.station_id) and not EXISTS (select * from observations o where o.time = '2019-11-09 13:50:34' and station_id = '古亭');

-- 假如即時監測資料的測站有在我們stations的名單內的話，就select出這些名單測站的監測數值。
select * from observations o where EXISTS (select * from stations s where s.stationId = o.station_id);

-- 假設當前時間、當前測站的監測數據已經不存在我們observation資料表中的話，我們就將此次接收到的數據insert into到observation資料表中。
select * from observations o where EXISTS (select * from observations o where o.time = '2019-11-09 13:50:34' and station_id = '古亭');

-- 該測站的此時間已經存在監測數據，因此不需要再次加入此資料表。
select EXISTS (select * from observations o where o.time = '2019-11-10 14:30:00' and station_id = '466940');

-- 該測站的此時間在資料表中不存在監測數據，因此我們進行新增該筆資料。
insert into 
	observations (wind, time, station_id)
select 
	10 as 'wind',
	'2019-11-10 13:55:34' as 'time',
	'古亭' as 'station_id'
where 
	(select 
		not EXISTS 
			(select
				*
			from 
				observations o 
			where 
				o.time = '2019-11-10 13:55:34' and
				station_id = '古亭')
	) = 1;
select * from observations where station_id = 'C0AI40';
delete from observations;

SELECT 
	s.stationId,
	s.stationName,
	s.x,
	s.y,
	s.type,
	s.amsl,
	s.a,
	s.z0,
	o.wind,
	MAX(o.time) AS time
FROM
	stations AS s 
	LEFT JOIN observations AS o 
	ON 
	s.stationId = o.station_id AND 
	o.time > CURRENT_TIMESTAMP - INTERVAL 60 MINUTE GROUP BY stationId
	
SHOW GLOBAL VARIABLES LIKE 'time_zone';

SELECT CONVERT_TZ('2016-01-01 12:00:00','+00:00','+8:00');
select UTC_TIMESTAMP();
select CURRENT_TIME;

select version();

select id,gid,grid, ST_INTERSECTION(ST_GEOMFROMTEXT(@target), grid) as intersection from idw where ST_AsText(ST_INTERSECTION(ST_GEOMFROMTEXT(@target), grid)) != 'GEOMETRYCOLLECTION EMPTY';
select * from idw where ST_AsText(ST_INTERSECTION(ST_GEOMFROMTEXT(@target), grid)) != 'GEOMETRYCOLLECTION EMPTY';


-- 使用者繪製的面資料(geojson feature polygon格式)
set @userPolygon = '{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[121.53398036956787,25.022189807895494],[121.53303623199464,25.0161620999479],[121.53616905212401,25.012350880280824],[121.53784275054932,25.010523008471576],[121.5433359146118,25.00993963940132],[121.54745578765868,25.011339720514588],[121.54908657073975,25.01324536082607],[121.55200481414794,25.014917633063533],[121.55123233795165,25.016278768071654],[121.54694080352783,25.020439858658317],[121.54273509979247,25.021062065689673],[121.53801441192627,25.023278652607715],[121.53398036956787,25.022189807895494]]]}}';
-- 將geojson轉換成geometry格式
set @target = ST_AsText(ST_GEOMFROMGEOJSON(@userPolygon));
select @target;

select ST_AsText(ST_GEOMFROMGEOJSON(@userPolygon));

select
	gid,
	u100,
	ST_AsGEOJSON(ST_INTERSECTION(ST_GEOMFROMGEOJSON(@userPolygon), grid)) as grid,
	time
from
	idw
where
	-- 篩選出最新一筆的idw圖層
	time = (select time from idw order by time desc limit 1) and
	-- 篩選出有交集的網格，沒有交集的會是'GEOMETRYCOLLECTION EMPTY'
	ST_AsText(ST_INTERSECTION(ST_GEOMFROMGEOJSON(@userPolygon), grid)) != 'GEOMETRYCOLLECTION EMPTY';

-- 最新的idw圖層與使用者設定範圍進行交集，所獲得出來的網格資料。
-- select
-- 	gid,
-- 	u100,
-- 	ST_AsGEOJSON(ST_INTERSECTION(ST_GEOMFROMTEXT(@target), grid))
-- from
-- 	idw
-- where
-- 	-- 篩選出最新一筆的idw圖層
-- 	time = (select time from idw order by time desc limit 1) and
-- 	-- 篩選出有交集的網格，沒有交集的會是'GEOMETRYCOLLECTION EMPTY'
-- 	ST_AsText(ST_INTERSECTION(ST_GEOMFROMTEXT(@target), grid)) != 'GEOMETRYCOLLECTION EMPTY';


-- 使用者範圍與z0交集的結果
-- set @userPolygon = '{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[121.53687710589485,25.01901753431848],[121.53912289410515,25.01901753431848],[121.53912289410515,25.016982457248005],[121.53687710589485,25.016982457248005],[121.53687710589485,25.01901753431848]]]},"properties":null}]}';
set @userPolygon = '{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[121.53138845553174,25.018643874114048],[121.53114029438923,25.01852218166883],[121.53090105526798,25.018386609111005],[121.53067168233548,25.018237691438543],[121.53045308082191,25.018076016314012],[121.5302461134476,25.017902221746198],[121.53005159701817,25.01771699357292],[121.52987029920116,25.017521062755108],[121.52970293549618,25.017315202492867],[121.52955016641133,25.0171002251748],[121.52941259485641,25.01687697917255],[121.52929076376347,25.016646345493456],[121.5291851539442,25.016409234304234],[121.52909618219226,25.016166581339732],[121.52902419963856,25.015919344210317],[121.52896949036533,25.015668498623256],[121.52893227028508,25.01541503453251],[121.52891268628849,25.015159952231897],[121.52891081566462,25.014904258407796],[121.52892666579595,25.01464896216629],[121.52896017412928,25.0143950710506],[121.52901120842253,25.014143587064765],[121.52907956726663,25.013895502719038],[121.5291649808805,25.01365179711253],[121.52926711217556,25.013413432068845],[121.52938555808633,25.013181348339685],[121.52951985116083,25.012956461891733],[121.52966946140572,25.01273966029089],[121.52983379837768,25.012531799199152],[121.53001221351373,25.01233369899667],[121.53020400269091,25.012146141543496],[121.5304084090049,25.01196986709317],[121.53062462575738,25.01180557137043],[121.53085179963963,25.011653902824747],[121.53108903410008,25.0115154600704],[121.53133539288272,25.01139078952332],[121.53158990372201,25.0112803832438],[121.5318515621799,25.01118467699402],[121.53211933560999,25.011104048517595],[121.53239216723294,25.011038816048227],[121.53266898030692,25.010989237053394],[121.53294868237725,25.010955507217787],[121.5332301695876,25.010937759670767],[121.53351233103655,25.010936064460722],[121.53379405316181,25.01095042827852],[121.5340742241348,25.010980794431106],[121.53435173824872,25.011027043065383],[121.53462550028216,25.0110889916413],[121.53489442982139,25.011166395652552],[121.53515746552445,25.01125894959199],[121.53541356930953,25.01136628815769],[121.53566173045203,25.01148798769522],[121.53590096957329,25.011623567870203],[121.5361303425058,25.011772493564564],[121.53634894401935,25.0119341769892],[121.53655591139369,25.01210798000446],[121.5367504278231,25.012293216639293],[121.53693172564012,25.012489155799315],[121.53709908934509,25.012695024152876],[121.53725185842994,25.01291000918374],[121.53738942998488,25.013133262398654],[121.5375112610778,25.01336390267656],[121.5376168708971,25.01360101974656],[121.53770584264902,25.01384367778124],[121.53777782520271,25.014090919090123],[121.53783253447594,25.014341767900063],[121.53786975455618,25.01459523420631],[121.53788933855279,25.0148503176801],[121.53789120917665,25.01510601161651],[121.53787535904534,25.01536130690775],[121.53784185071201,25.01561519602552],[121.53779081641876,25.015866676997362],[121.53772245757466,25.016114757360484],[121.5376370439608,25.0163584580786],[121.5375349126657,25.016596817405187],[121.53741646675496,25.016828894678753],[121.53728217368044,25.017053774034466],[121.53713256343555,25.017270568018134],[121.53696822646361,25.017478421087986],[121.53678981132754,25.01767651299035],[121.53659802215036,25.01786406199608],[121.53639361583636,25.018040327984863],[121.53617739908388,25.01820461536539],[121.53595022520166,25.01835627581977],[121.5357129907412,25.01849471086129],[121.53546663195854,25.018619374195723],[121.53521212111929,25.01872977387643],[121.5349504626614,25.018825474245375],[121.53468268923127,25.01890609765171],[121.53440985760835,25.018971325941592],[121.53413304453434,25.019020901713517],[121.53385334246401,25.019054629333624],[121.53357185525367,25.019072375707495],[121.53328969380472,25.019074070805203],[121.53300797167948,25.019059707937686],[121.53272780070648,25.019029343783004],[121.53245028659256,25.018983098162735],[121.53217652455913,25.018921153569437],[121.5319075950199,25.018843754446593],[121.53164455931682,25.018751206224195],[121.53138845553174,25.018643874114048]]]},"properties":{"type":"Polygon"}}';

select
	value,
	ST_AsGEOJSON(ST_INTERSECTION(ST_GEOMFROMGEOJSON(@userPolygon), grid)) as geometry
from
	z0
where
	ST_AsText(ST_INTERSECTION(ST_GEOMFROMGEOJSON(@userPolygon), grid)) != 'GEOMETRYCOLLECTION EMPTY'
union
-- 使用者範圍與idw中心點交集的結果

select
	u100 as value,
	ST_AsGEOJSON(ST_INTERSECTION(ST_GEOMFROMGEOJSON(@userPolygon), grid)) as geometry
from
	idw
where
	-- 篩選出最新一筆的idw圖層
	time = (select time from idw order by time desc limit 1) and
	-- 篩選出有交集的網格，沒有交集的會是'GEOMETRYCOLLECTION EMPTY'
	ST_AsText(ST_INTERSECTION(ST_GEOMFROMGEOJSON(@userPolygon), grid)) != 'GEOMETRYCOLLECTION EMPTY';


select * from z0;
set @userPolygon = '{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[121.53687710589485,25.01901753431848],[121.53912289410515,25.01901753431848],[121.53912289410515,25.016982457248005],[121.53687710589485,25.016982457248005],[121.53687710589485,25.01901753431848]]]},"properties":null}]}';

set @testPolygon = 'POLYGON ((121.53687710589485 25.016982457248005, 121.53687710589485 25.01720847208648, 121.53705457839325 25.01720847208648, 121.53705457839325 25.016982457248005, 121.53687710589485 25.016982457248005))';

select
	value,
	ST_INTERSECTION(ST_GEOMFROMGEOJSON(@userPolygon), grid) as geometry
from
	z0 z
where
	ST_AsText(ST_INTERSECTION(ST_GEOMFROMGEOJSON(@userPolygon), grid)) != 'GEOMETRYCOLLECTION EMPTY'
	

select
	ST_INTERSECTION(ST_GEOMFROMGEOJSON(@userPolygon), grid) as geometry
from
	idw
where
	time = (select time from idw order by time desc limit 1) and
	ST_AsText(ST_INTERSECTION(ST_GEOMFROMGEOJSON(@userPolygon), grid)) != 'GEOMETRYCOLLECTION EMPTY'

set @userPolygon = '{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[121.53138845553174,25.018643874114048],[121.53114029438923,25.01852218166883],[121.53090105526798,25.018386609111005],[121.53067168233548,25.018237691438543],[121.53045308082191,25.018076016314012],[121.5302461134476,25.017902221746198],[121.53005159701817,25.01771699357292],[121.52987029920116,25.017521062755108],[121.52970293549618,25.017315202492867],[121.52955016641133,25.0171002251748],[121.52941259485641,25.01687697917255],[121.52929076376347,25.016646345493456],[121.5291851539442,25.016409234304234],[121.52909618219226,25.016166581339732],[121.52902419963856,25.015919344210317],[121.52896949036533,25.015668498623256],[121.52893227028508,25.01541503453251],[121.52891268628849,25.015159952231897],[121.52891081566462,25.014904258407796],[121.52892666579595,25.01464896216629],[121.52896017412928,25.0143950710506],[121.52901120842253,25.014143587064765],[121.52907956726663,25.013895502719038],[121.5291649808805,25.01365179711253],[121.52926711217556,25.013413432068845],[121.52938555808633,25.013181348339685],[121.52951985116083,25.012956461891733],[121.52966946140572,25.01273966029089],[121.52983379837768,25.012531799199152],[121.53001221351373,25.01233369899667],[121.53020400269091,25.012146141543496],[121.5304084090049,25.01196986709317],[121.53062462575738,25.01180557137043],[121.53085179963963,25.011653902824747],[121.53108903410008,25.0115154600704],[121.53133539288272,25.01139078952332],[121.53158990372201,25.0112803832438],[121.5318515621799,25.01118467699402],[121.53211933560999,25.011104048517595],[121.53239216723294,25.011038816048227],[121.53266898030692,25.010989237053394],[121.53294868237725,25.010955507217787],[121.5332301695876,25.010937759670767],[121.53351233103655,25.010936064460722],[121.53379405316181,25.01095042827852],[121.5340742241348,25.010980794431106],[121.53435173824872,25.011027043065383],[121.53462550028216,25.0110889916413],[121.53489442982139,25.011166395652552],[121.53515746552445,25.01125894959199],[121.53541356930953,25.01136628815769],[121.53566173045203,25.01148798769522],[121.53590096957329,25.011623567870203],[121.5361303425058,25.011772493564564],[121.53634894401935,25.0119341769892],[121.53655591139369,25.01210798000446],[121.5367504278231,25.012293216639293],[121.53693172564012,25.012489155799315],[121.53709908934509,25.012695024152876],[121.53725185842994,25.01291000918374],[121.53738942998488,25.013133262398654],[121.5375112610778,25.01336390267656],[121.5376168708971,25.01360101974656],[121.53770584264902,25.01384367778124],[121.53777782520271,25.014090919090123],[121.53783253447594,25.014341767900063],[121.53786975455618,25.01459523420631],[121.53788933855279,25.0148503176801],[121.53789120917665,25.01510601161651],[121.53787535904534,25.01536130690775],[121.53784185071201,25.01561519602552],[121.53779081641876,25.015866676997362],[121.53772245757466,25.016114757360484],[121.5376370439608,25.0163584580786],[121.5375349126657,25.016596817405187],[121.53741646675496,25.016828894678753],[121.53728217368044,25.017053774034466],[121.53713256343555,25.017270568018134],[121.53696822646361,25.017478421087986],[121.53678981132754,25.01767651299035],[121.53659802215036,25.01786406199608],[121.53639361583636,25.018040327984863],[121.53617739908388,25.01820461536539],[121.53595022520166,25.01835627581977],[121.5357129907412,25.01849471086129],[121.53546663195854,25.018619374195723],[121.53521212111929,25.01872977387643],[121.5349504626614,25.018825474245375],[121.53468268923127,25.01890609765171],[121.53440985760835,25.018971325941592],[121.53413304453434,25.019020901713517],[121.53385334246401,25.019054629333624],[121.53357185525367,25.019072375707495],[121.53328969380472,25.019074070805203],[121.53300797167948,25.019059707937686],[121.53272780070648,25.019029343783004],[121.53245028659256,25.018983098162735],[121.53217652455913,25.018921153569437],[121.5319075950199,25.018843754446593],[121.53164455931682,25.018751206224195],[121.53138845553174,25.018643874114048]]]},"properties":{"type":"Polygon"}}';

set @userPolygon = '{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[121.53687710589485,25.01901753431848],[121.53912289410515,25.01901753431848],[121.53912289410515,25.016982457248005],[121.53687710589485,25.016982457248005],[121.53687710589485,25.01901753431848]]]},"properties":null}]}';
-- z0 為10公尺的面資料，包含粗糙度的屬性
-- idw 為50公尺的面資料，包含u100的屬性
-- 目的：將u100傳遞至z0，並篩選出使用者範圍中的z0網格

select
	AVG(u100) as u100,
	z0.value as value,
	ST_AsGeojson(z0.geometry) as grid,
	time
from 
(
	select
		gid,
		u100,
		time,
		ST_INTERSECTION(ST_GEOMFROMGEOJSON(@userPolygon), grid) as geometry
	from
		idw
	where
		time = (select time from idw order by time desc limit 1) and
		ST_AsText(ST_INTERSECTION(ST_GEOMFROMGEOJSON(@userPolygon), grid)) != 'GEOMETRYCOLLECTION EMPTY'
) as idw,
(
	select
		id,
		value,
		ST_INTERSECTION(ST_GEOMFROMGEOJSON(@userPolygon), grid) as geometry
	from
		z0
	where
		ST_AsText(ST_INTERSECTION(ST_GEOMFROMGEOJSON(@userPolygon), grid)) != 'GEOMETRYCOLLECTION EMPTY'
) as z0
where
	ST_AsText(ST_INTERSECTION(idw.geometry, z0.geometry)) != 'GEOMETRYCOLLECTION EMPTY'
group by z0.id;



-- test
-- z0	
set @userPolygon = '{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[121.53138845553174,25.018643874114048],[121.53114029438923,25.01852218166883],[121.53090105526798,25.018386609111005],[121.53067168233548,25.018237691438543],[121.53045308082191,25.018076016314012],[121.5302461134476,25.017902221746198],[121.53005159701817,25.01771699357292],[121.52987029920116,25.017521062755108],[121.52970293549618,25.017315202492867],[121.52955016641133,25.0171002251748],[121.52941259485641,25.01687697917255],[121.52929076376347,25.016646345493456],[121.5291851539442,25.016409234304234],[121.52909618219226,25.016166581339732],[121.52902419963856,25.015919344210317],[121.52896949036533,25.015668498623256],[121.52893227028508,25.01541503453251],[121.52891268628849,25.015159952231897],[121.52891081566462,25.014904258407796],[121.52892666579595,25.01464896216629],[121.52896017412928,25.0143950710506],[121.52901120842253,25.014143587064765],[121.52907956726663,25.013895502719038],[121.5291649808805,25.01365179711253],[121.52926711217556,25.013413432068845],[121.52938555808633,25.013181348339685],[121.52951985116083,25.012956461891733],[121.52966946140572,25.01273966029089],[121.52983379837768,25.012531799199152],[121.53001221351373,25.01233369899667],[121.53020400269091,25.012146141543496],[121.5304084090049,25.01196986709317],[121.53062462575738,25.01180557137043],[121.53085179963963,25.011653902824747],[121.53108903410008,25.0115154600704],[121.53133539288272,25.01139078952332],[121.53158990372201,25.0112803832438],[121.5318515621799,25.01118467699402],[121.53211933560999,25.011104048517595],[121.53239216723294,25.011038816048227],[121.53266898030692,25.010989237053394],[121.53294868237725,25.010955507217787],[121.5332301695876,25.010937759670767],[121.53351233103655,25.010936064460722],[121.53379405316181,25.01095042827852],[121.5340742241348,25.010980794431106],[121.53435173824872,25.011027043065383],[121.53462550028216,25.0110889916413],[121.53489442982139,25.011166395652552],[121.53515746552445,25.01125894959199],[121.53541356930953,25.01136628815769],[121.53566173045203,25.01148798769522],[121.53590096957329,25.011623567870203],[121.5361303425058,25.011772493564564],[121.53634894401935,25.0119341769892],[121.53655591139369,25.01210798000446],[121.5367504278231,25.012293216639293],[121.53693172564012,25.012489155799315],[121.53709908934509,25.012695024152876],[121.53725185842994,25.01291000918374],[121.53738942998488,25.013133262398654],[121.5375112610778,25.01336390267656],[121.5376168708971,25.01360101974656],[121.53770584264902,25.01384367778124],[121.53777782520271,25.014090919090123],[121.53783253447594,25.014341767900063],[121.53786975455618,25.01459523420631],[121.53788933855279,25.0148503176801],[121.53789120917665,25.01510601161651],[121.53787535904534,25.01536130690775],[121.53784185071201,25.01561519602552],[121.53779081641876,25.015866676997362],[121.53772245757466,25.016114757360484],[121.5376370439608,25.0163584580786],[121.5375349126657,25.016596817405187],[121.53741646675496,25.016828894678753],[121.53728217368044,25.017053774034466],[121.53713256343555,25.017270568018134],[121.53696822646361,25.017478421087986],[121.53678981132754,25.01767651299035],[121.53659802215036,25.01786406199608],[121.53639361583636,25.018040327984863],[121.53617739908388,25.01820461536539],[121.53595022520166,25.01835627581977],[121.5357129907412,25.01849471086129],[121.53546663195854,25.018619374195723],[121.53521212111929,25.01872977387643],[121.5349504626614,25.018825474245375],[121.53468268923127,25.01890609765171],[121.53440985760835,25.018971325941592],[121.53413304453434,25.019020901713517],[121.53385334246401,25.019054629333624],[121.53357185525367,25.019072375707495],[121.53328969380472,25.019074070805203],[121.53300797167948,25.019059707937686],[121.53272780070648,25.019029343783004],[121.53245028659256,25.018983098162735],[121.53217652455913,25.018921153569437],[121.5319075950199,25.018843754446593],[121.53164455931682,25.018751206224195],[121.53138845553174,25.018643874114048]]]},"properties":{"type":"Polygon"}}';
select
	AVG(u100) as u100,
	z0.value as value,
	ST_AsGeojson(z0.geometry) as geometry,
	time
from 
(
	select
		gid,
		u100,
		time,
		grid as geometry
	from
		idw
	where
		time = (select time from idw order by time desc limit 1) and
		ST_INTERSECTS(ST_GEOMFROMGEOJSON(@userPolygon), grid)
) as idw,
(
	select
		id,
		value,
		grid as geometry
	from
		z0
	where
		ST_INTERSECTS(ST_GEOMFROMGEOJSON(@userPolygon), grid)
) as z0
where
	ST_INTERSECTS(idw.geometry, z0.geometry)
group by z0.id;



select
    AVG(u100) as u100,
    SurfaceRoughness.value as value,
    ST_AsGeojson(SurfaceRoughness.geometry) as geometry,
    time
from 
(
    select
        gid,
        u100,
        time,
        grid as geometry
    from
        idw
    where
        time = (select time from idw order by time desc limit 1) and
        ST_INTERSECTS(ST_GEOMFROMGEOJSON(@userPolygon), grid)
) as idw,
(
    select
        id,
        value,
        grid as geometry
    from
        SurfaceRoughness
    where
        ST_INTERSECTS(ST_GEOMFROMGEOJSON(@userPolygon), grid)
) as SurfaceRoughness
where
    ST_INTERSECTS(idw.geometry, SurfaceRoughness.geometry)
group by SurfaceRoughness.id;



select
    gid,
    u100,
    time,
    grid as geometry
from
    idw
where
    time = (select time from idw order by time desc limit 1) and
    ST_INTERSECTS(ST_GEOMFROMGEOJSON(@userPolygon), grid)
    
select 
    s.stationId,
    s.stationName,
    s.x,
    s.y,
    s.type,
    s.amsl,
    s.a,
    s.z0,
    o.wind,
    MAX(o.time) as time
from stations as s LEFT JOIN observations as o ON 
    s.stationId = o.station_id and
    o.time > CURRENT_TIMESTAMP - INTERVAL 60 MINUTE
group by stationId;

               