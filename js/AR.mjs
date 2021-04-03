import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import { TubePainter } from 'https://unpkg.com/three@0.126.1/examples/jsm/misc/TubePainter.js';
import { ARButton } from './ARButton.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.126.1/examples/jsm/loaders/GLTFLoader.js';
//import * as HTML from '../node_modules/html2canvas/dist/html2canvas.min.js';
import { MTLLoader } from 'https://unpkg.com/three@0.126.1/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'https://unpkg.com/three@0.126.1/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from "https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js";

import { EXRLoader } from 'https://unpkg.com/three@0.126.1/examples/jsm/loaders/EXRLoader.js';

const html = `<div id="controls">
    <div id="resetbutton">
        <button id="button-reset" alt="Draw"></button>
    </div>
    <!-- <button id="button-action" alt="Toggle Flash"></button> -->
    <button id="button-mode-toggle" alt="Toggle mode" class="dynamic">
        <span class='static-mode'></span>
        <span class='dynamic-mode'></span>
    </button>
    <button id="button-close" alt="Close"></button>
</div>
<div id="menus">
    <div id="trails_menu">
        <div style="min-width: calc(50vw - 45px); height: 50px; flex: 1 0 auto;"></div>
        <img id="exit-trail" class="small-x-button" src="./assets/small-x.svg" alt="Exit Trail">
        <div style="min-width: 200px; height: 50px; flex: 1 0 auto;"></div>
    </div>

    <div id="aircrafts_menu">
        <div class="buffer" style="height: 50px; flex: 1 0 auto;"></div>
        <div class="buffer" style="height: 50px; flex: 1 0 auto;"></div>
    </div>

    <div id="settings_menu">
        <div class="middleCircle"></div>
        <div style="width: 40px;"></div>
        <!-- <div class="mode-menu">
            <div>GIF</div>
            <div class="selected">תמונה</div>
            <div>סרטון</div>
        </div>
        <img class="flip-camera" src="./assets/flip-camera.svg" alt="Flip Camera"> -->
    </div>
</div>
<div id="tutorial">
    <div class="step step-1">
        <h2>ציירו מסלול במרחב</h2>
        <p>התחילו ללכת תוך כדי ציור המסלול על גבי המסך</p>
        <div class="screen-example">
        </div>
        <nav>
            <span class='active'></span><span></span><span></span>
            <button class='next' onclick="finishTutorial(1)">הבא</button>
        </nav>
    </div>
    <div class="step step-2">
        <h2>צפו במטוסים על המסלוול</h2>
        <p>שלום עולם כאן מטוס גדול</p>
        <div class="screen-example">
        </div>
        <nav>
            <span></span><span class='active'></span><span></span>
            <button class='next' onclick="finishTutorial(2)">הבא</button>
        </nav>
    </div>
    <div class="step step-3">
        <h2>ציירו מסלול במרחב</h2>
        <p>התחילו ללכת תוך כדי ציור המסלול על גבי המסך</p>
        <div class="screen-example">
        </div>
        <nav>
            <span></span><span></span><span class='active'></span>
            <button class='next' onclick="finishTutorial(3)">הבא</button>
        </nav>
    </div>
</div>`;

var elem = document.createElement('div');
elem.id = "ar-overly";
elem.innerHTML = html;
document.body.append(elem);

setTimeout(() => {

    
    let container;
    let camera, controls, scene, renderer;
    let mixer, clock, action, delta;
    let controller, painter, aircraft, animations;
    let animationCycleStart = new Date();
    let trails = [];
    let planeMesh;
    let pngCubeRenderTarget, exrCubeRenderTarget;
    let pngBackground, exrBackground;
    const cursor = new THREE.Vector3();

    const params = {
        envMap: 'EXR',
        roughness: 0.0,
        metalness: 0.0,
        exposure: 1.5,
        debug: false,
    };

    const magenDavid2d = [
        // top triangle
        [1 / 3, Math.sqrt(3) / 2 + Math.sqrt(3) / 6],
        [1 / 3, Math.sqrt(3) / 2 + Math.sqrt(3) / 6],
        [1, 0],
        [-1, 0],
        [0, Math.sqrt(3)],
        [1 / 3, Math.sqrt(3) / 2 + Math.sqrt(3) / 6],
        //bottom
        [1, Math.sqrt(3) / 2 + Math.sqrt(3) / 6],
        [0, -Math.sqrt(3) / 2 + Math.sqrt(3) / 6],
        [-1, Math.sqrt(3) / 2 + Math.sqrt(3) / 6],
        [1 / 3, Math.sqrt(3) / 2 + Math.sqrt(3) / 6],
        //[1, 0],
    ]
    const bigMagenDavid = magenDavid2d.map(([x, y]) => [0, y / 20, -x / 20]);
    const smallMagenDavid = magenDavid2d.map(([x, y]) => [-0.1, y / 5 - 0.1, -x / 5]);

    const spiral = [[-0.5243040872910524, -1.484632886795791, 0.7090383618241618], [-0.5033054322967195, -1.4843123091178931, 0.7165561738046619], [-0.46344087210143464, -1.4791284908216729, 0.7376674301865676], [-0.46344087210143464, -1.4791284908216729, 0.7376674301865676], [-0.44479599775559514, -1.4741336008104202, 0.75111355867189], [-0.36264799906998924, -1.478861033419382, 0.7831055910920952], [-0.3957490414418604, -1.4615587930971525, 0.7734690578792921], [-0.3695920092150864, -1.4543072886199382, 0.7769178872061469], [-0.34265271989342705, -1.446316226287704, 0.7765454110755049], [-0.3160412112066088, -1.4368292362554282, 0.7752649720267523], [-0.2883114494760768, -1.4256979497124185, 0.7730351662717032], [-0.2585838564919497, -1.4134269235207413, 0.7667365865762239], [-0.23401955079366102, -1.395381431982618, 0.7572916391659038], [-0.20087857656894298, -1.3862242567990586, 0.7369247211720386], [-0.17009094520149, -1.3705339581193274, 0.7184548084845019], [-0.14063167142174995, -1.3532899006487473, 0.698459010680089], [-0.11395066893123873, -1.3302283337608087, 0.6805843137411128], [-0.08562343574138237, -1.315601174249601, 0.650661307014985], [-0.06122284164057111, -1.2959170561413371, 0.6216246746269591], [-0.04014302565014784, -1.2759020345610212, 0.5906959342861335], [-0.022427606767085096, -1.2554074781752562, 0.5600956432356616], [-0.010855541497713922, -1.2312399764051076, 0.5292184065414154], [-1.9136781425002636E-4, -1.2097931900386045, 0.49666550610406957], [0.007469361654925094, -1.1902478304171622, 0.4615837275573309], [0.011594300989302099, -1.1723729596496062, 0.4264980535484094], [0.012393897026085465, -1.1565243548208135, 0.39343088643396873], [0.009311985318086375, -1.1436457498623538, 0.3617998114526732], [-3.9533663986887456E-4, -1.130815053739229, 0.33069354030387865], [-0.011383182227829764, -1.1229365483956129, 0.30097039384817886], [-0.023946467970247833, -1.117912016984075, 0.27258854353771383], [-0.03881496261948886, -1.1153648714830489, 0.24621726181127526], [-0.05627747368652733, -1.1152571756237624, 0.2220665911214309], [-0.07561351108475313, -1.1171504315061451, 0.20032655567332017], [-0.09771163679461083, -1.1225905543529426, 0.1813172592270201], [-0.12028029428372425, -1.1282340031373714, 0.16438848394470307], [-0.1448214190698607, -1.1353652842985928, 0.15056577642204616], [-0.17142538531759605, -1.1441407722621884, 0.14003607261332723], [-0.19991360442434633, -1.1541350956839724, 0.1321554843441558], [-0.22974200091711533, -1.1643608330636286, 0.12457470339148337], [-0.26214805979245404, -1.177791783636533, 0.11730206308391408], [-0.2936484560932517, -1.1887282876581398, 0.11237014774994115], [-0.32560510602472065, -1.198949873579216, 0.11171999091412807], [-0.3577007269067081, -1.2083978245662235, 0.11483176015627208], [-0.38954208523319384, -1.2164275370467503, 0.11950471683407007], [-0.4207341792389336, -1.2227737893080077, 0.12502533776150473], [-0.4522420025598059, -1.229115549449229, 0.13208757467580168], [-0.480272056879909, -1.2329709979884922, 0.1422749735057937], [-0.505374360497268, -1.2352229981467766, 0.15604603360902622], [-0.5292315175313036, -1.2362848273087268, 0.17344518087999197], [-0.5526557439625904, -1.2362551932682448, 0.19385460636145535], [-0.5750956947689694, -1.2352397144016138, 0.2177453031169222], [-0.5968971281243571, -1.2346741575906663, 0.24472028406079377], [-0.6171869475820351, -1.232194994521635, 0.274678366063194], [-0.6359349113412978, -1.2282776432607243, 0.3057848167542821], [-0.6526273238939946, -1.2231136400146985, 0.33710294041207006], [-0.6694113712065112, -1.2167056208792453, 0.36872634043123026], [-0.6880761533869235, -1.2089169336722885, 0.40156286381346873], [-0.708883556452444, -1.2002899611192235, 0.43777775816245434], [-0.7210679955028545, -1.1887782631093682, 0.4808052658417939], [-0.7314458607857011, -1.176055101976087, 0.5094337530663454], [-0.73122125685475, -1.1630080477462044, 0.5334219486382663], [-0.7279854370608309, -1.1487873042161998, 0.5534025714513436], [-0.7229874471701958, -1.1322951585332552, 0.5758223242667244], [-0.7126667105445086, -1.1137098417474387, 0.6086532934790282], [-0.7100586609909593, -1.0918956691744763, 0.6350127699546984], [-0.6978595681036832, -1.0689910705039603, 0.6607003420998434], [-0.6727868565632993, -1.045797665404348, 0.6802753307978038], [-0.6370095197901207, -1.0208504973141113, 0.6980804136262958], [-0.5992227409350408, -0.9936700167440133, 0.7146064722636813], [-0.5597302372852545, -0.9659604897631018, 0.7316095095347257], [-0.5323586547201321, -0.9376854090754839, 0.7362149432152283], [-0.5021034799073033, -0.9089746080458228, 0.7406307382947283], [-0.4696284785294436, -0.8789248190181167, 0.7435468472884277], [-0.43193062088553813, -0.8462053687529932, 0.7475508539167992], [-0.39385880118038213, -0.8115800662222377, 0.7504700565334086], [-0.35961825003888903, -0.7769721412602834, 0.7480724319427418], [-0.33102232123197173, -0.7457448186725882, 0.743225235823927], [-0.3031773097856685, -0.7067926236551436, 0.7319411910076472], [-0.2721954015575395, -0.67433385396398, 0.7187906609937691], [-0.2386294464189657, -0.6341015607203889, 0.7040252755047949], [-0.2062738039456325, -0.5949349239753893, 0.6801750201664495], [-0.17580070068660303, -0.5570414041846716, 0.6474443772017776], [-0.14650137428736096, -0.5139993241399745, 0.6128284743653698], [-0.11855658952250446, -0.47629004147629384, 0.5801330213403397], [-0.09289720787508475, -0.4317125584407202, 0.5500483532082074], [-0.07099513493667133, -0.3867537109373716, 0.5196827238198322], [-0.05066096035390408, -0.3432622109587528, 0.4884705141023318], [-0.040836164375534445, -0.29823999370666787, 0.45233173040158026], [-0.030758116782437714, -0.2613773008809395, 0.4177666033003497], [-0.023413631023287598, -0.2232763587791114, 0.37987553140631536], [-0.01950297515439002, -0.18805039288980158, 0.34031083604375134], [-0.018650027850378934, -0.15624534938377999, 0.30083476631981865], [-0.01945285271958269, -0.1261350921874372, 0.26138155751059156], [-0.024605114996665907, -0.10546233051321031, 0.22558574954667163], [-0.03263718830092481, -0.08806401764668864, 0.18898798148556115], [-0.04328044415713798, -0.07553040067631758, 0.15404463396183057], [-0.05412005073220827, -0.06553115294640932, 0.11990574427924316], [-0.06927349395336331, -0.06324505094398308, 0.089716706763651], [-0.08370262543082253, -0.06277895254807625, 0.05993208181267042], [-0.09873928153445072, -0.06567026061675786, 0.03181723038565472], [-0.11494575465867667, -0.07187828282894376, 0.005644940335545686], [-0.13268370965836251, -0.08106872212511256, -0.01829980291156192], [-0.15238576456878405, -0.09304511152905248, -0.04002280188003947], [-0.17185093684645908, -0.10498046448227477, -0.059983123792808], [-0.19627559604674327, -0.12298017776233006, -0.07844378206403634], [-0.21891970275210987, -0.13966364352652344, -0.09458755993564513], [-0.24298978538311775, -0.15870239368133818, -0.10712237476162259], [-0.26643599506456683, -0.17784635321660663, -0.11594103341832272], [-0.2893107822287143, -0.19696193878297952, -0.1219927412522937], [-0.3134378741610124, -0.21629231883615213, -0.12601828131185214], [-0.3401095861824646, -0.23593041769764633, -0.12870506044011282], [-0.36840629696727895, -0.2555629906889552, -0.13003970154475367], [-0.397105218518982, -0.2763251038282878, -0.12834041127156529], [-0.4227957652919867, -0.29578874442206426, -0.12274602906408648], [-0.44693607030552995, -0.3146376554100201, -0.11352389154257687], [-0.4728296377089606, -0.33303918398292176, -0.1029717864681898], [-0.500616460846874, -0.3505470695327928, -0.09337582347107651], [-0.5285608597553898, -0.36711389240086156, -0.08414844175473597], [-0.5552539858020309, -0.3839192128090363, -0.07115393397265367], [-0.577157445311114, -0.40013119096072447, -0.053140490468417075], [-0.5945499239539183, -0.4156221242129328, -0.030686863124592033], [-0.6112760255493396, -0.42995341979807045, -0.007976170159704962], [-0.6308370210046845, -0.4433314027099948, 0.012182461796805502], [-0.653251969052098, -0.4562787863467264, 0.03123764529678842], [-0.6756382933269431, -0.46940991277018373, 0.05596939666275321], [-0.6952558901001947, -0.48176832202846187, 0.08665020106849006], [-0.7122702667860493, -0.49281173551189705, 0.1228706328883947], [-0.7294127943579813, -0.5020997638958046, 0.1620742807004757], [-0.7477348219408114, -0.5094808466745798, 0.20060631875966553], [-0.765711835461416, -0.515247364045141, 0.23766713081131502], [-0.7825907468159049, -0.5190161397354517, 0.26821549625699664], [-0.7952280386947231, -0.5204718521672554, 0.29797827659432063], [-0.8014527579109266, -0.5187541937329464, 0.3350984749774993], [-0.8031028272154498, -0.5126081359311044, 0.3837420993915995], [-0.8034540531491529, -0.5018653923772182, 0.4380618917331934], [-0.8002577522464348, -0.48914800171453504, 0.4971422138323369], [-0.7980954612927491, -0.47370374742701915, 0.5358091426819092], [-0.7887788412254148, -0.4564392445315567, 0.5730824415722897], [-0.7755841537127168, -0.4374954210078297, 0.6054713358114292], [-0.759534311403717, -0.416058405411452, 0.6371239388183397], [-0.7391698340525252, -0.3906216653131353, 0.6721416387120975], [-0.7159353077312509, -0.36145993677926835, 0.7091061422459881], [-0.6897705091623362, -0.3319651980584978, 0.7442650075772965], [-0.6613203396340601, -0.30231479192952215, 0.7719739306964398], [-0.629341385439487, -0.27215260927652196, 0.7945571801762243], [-0.5945045556285504, -0.24076450839121005, 0.8141694590818496], [-0.557419200316459, -0.20971214612848108, 0.8296636293084946], [-0.5185148937253572, -0.1810719007534215, 0.8432176221276086], [-0.478720135234563, -0.152337828713348, 0.8527927774711939], [-0.4392891001466856, -0.12291675488201288, 0.8612313935730055], [-0.4008879989785227, -0.09300841050983984, 0.8689779452871335], [-0.36310513376571746, -0.0664236773849326, 0.8719990251924965], [-0.3200181165533412, -0.04323922085595577, 0.8618459832798907], [-0.28263955354162895, -0.03626980530117596, 0.8484286067379696], [-0.24144736568717112, -0.027549692026928314, 0.8322293718373379], [-0.202598654848054, -0.01755726861246938, 0.8125172671875577], [-0.16480648273350793, -0.007236666985590889, 0.7896012259468383], [-0.12432997108914746, 0.005578279084194442, 0.7658463429726662], [-0.08199875607412738, 0.02135437888122338, 0.7428015985653508], [-0.040979733354634576, 0.03862656677082424, 0.7198526090098291], [-0.0024552233084406128, 0.05487495026973466, 0.7012413503407615], [0.03454804942443357, 0.07104273177556031, 0.6746244835835661], [0.06957659628797036, 0.08459994303328344, 0.6402715679351445], [0.10192869947715455, 0.09509406053822489, 0.5993482212764158], [0.13087036765072724, 0.10362981578597064, 0.5549520019421708], [0.15489821764347672, 0.11139950968880663, 0.5116815503778749], [0.17323624651585717, 0.11747911472906403, 0.47356615770333743], [0.18805578636659098, 0.12368625635669517, 0.4356877684198003], [0.20098015598446686, 0.12898421660528048, 0.3959889824107424], [0.21165307847874482, 0.13232064598630092, 0.35338804906765114], [0.21889418001316852, 0.13349287524281797, 0.30972355329618606], [0.22266745022999723, 0.1327683987044641, 0.2660943086163497], [0.2252148450110909, 0.13115497867503412, 0.22445935344336526], [0.22698426370135993, 0.12985623145749114, 0.181933438883346], [0.2281829996282621, 0.12834329336125794, 0.13835079675431877], [0.22724393791710654, 0.12584538753048224, 0.09604605158944596], [0.22428632824917022, 0.12273949748133617, 0.05754236867607744], [0.22001751623880234, 0.11923792563441155, 0.02277162154107806], [0.21447455543530491, 0.11461944322883255, -0.009927938659410288], [0.20791249975225778, 0.10871163800375594, -0.047849920455025716], [0.20067639809654, 0.10225139264614501, -0.08797843389792347], [0.19889283837792898, 0.09914143437806267, -0.1226858872847822], [0.185229223001817, 0.09018489223885184, -0.1584499486396694], [0.175858396565937, 0.08354825380657945, -0.19031339316962223], [0.16764713557112673, 0.07846886658037068, -0.22061526314673324], [0.16067615265811863, 0.07490042539134001, -0.2499009094388316], [0.15317584862423705, 0.07118123570866419, -0.27570851148745973], [0.1425500162372798, 0.06509319884033382, -0.2988891750008443], [0.12921693459731265, 0.057209683316187886, -0.3213394774569781], [0.11572011083561529, 0.04950273951127793, -0.3407542321871794], [0.10486008325986095, 0.04454326930904548, -0.3485031901693787], [0.09976747148126675, 0.0429954760659802, -0.3499028086092656], [0.09713263926848889, 0.04318325905917282, -0.347679173047844], [0.09155386952325385, 0.04131638545612681, -0.3469415887312428], [0.08161059822351482, 0.03648945689330607, -0.3500880186589499], [0.0706925145466718, 0.0312211781489401, -0.35312865757957046], [0.06801258843917002, 0.03325510227624229, -0.3489230344102986], [0.058674357934792476, 0.028017303452849363, -0.34251216842559906], [0.05512226912728544, 0.027664585432119297, -0.3302293383868433], [0.04950369960962342, 0.025107015969318303, -0.3168306941219221], [0.04154523793697456, 0.020164124772248146, -0.30249554515316196], [0.03286903416620346, 0.014145033831104326, -0.28525535179994005], [0.02991561981852775, 0.014569392882236132, -0.2576905795798518], [0.018430703657391148, 0.005188422373768919, -0.23409424720255095], [0.012463186877713639, 7.692682688482666E-4, -0.2078892371108903], [0.007522291254610791, -0.0029383091581509646, -0.18024810401269536], [0.006215903132876899, -0.0029591456136977, -0.1511243281631316], [0.008976043636332198, 0.0014887440843482924, -0.11947828944765572], [0.013863958010288946, 0.009423301018327668, -0.07941399432044685], [0.018356750892392838, 0.017322830128394837, -0.03846534336771361], [0.021795803503889565, 0.025095733423035328, 0.004256047516047304], [0.025308912085856727, 0.03450281565257962, 0.04949426164475132], [0.029565039479857048, 0.04712056746948668, 0.09848364576089765], [0.03364077592786796, 0.06270909501950239, 0.15149014625155213], [0.035898385231294294, 0.07924121878997237, 0.2064063724454822], [0.03572016364136199, 0.09454888856256904, 0.26482548198241007], [0.03206360276379916, 0.10753963734702565, 0.3202391893809224], [0.026247421386403777, 0.11971498305862702, 0.3742975162054241], [0.019409421793524895, 0.1326680552029479, 0.42761255038434404], [0.011616690981677946, 0.14784752536720536, 0.4821781842865172], [0.0038806230188604698, 0.16552064380943965, 0.5421177454155278], [-0.006554396262044415, 0.1823600965179614, 0.5983711690394106], [-0.017714887349105587, 0.19724910618985558, 0.6496632424570201], [-0.02889854259938564, 0.2108178213688533, 0.6974661030495355], [-0.041020723361386666, 0.2243697278216697, 0.7448584938967147], [-0.054288586904103764, 0.2396973527784647, 0.7932773028665383], [-0.06824289135598438, 0.25674246463060724, 0.8415466559733397], [-0.08280528017261835, 0.2724997940272056, 0.8870831889788595], [-0.09716101486608608, 0.2856063403236495, 0.9285319106291736], [-0.10950252196387529, 0.29882929243276163, 0.9668528724297782], [-0.12012124170781913, 0.3126729488149699, 1.0031588903585926], [-0.13130442117516758, 0.325718112657893, 1.0387312805777773], [-0.1436747282943545, 0.33747396359588944, 1.0735568034652823], [-0.15552730273524754, 0.3476481037823037, 1.105631241965712], [-0.1669109181191765, 0.3560613083508929, 1.1346189048253223], [-0.17821630123786436, 0.3647143195475909, 1.1617219704762705], [-0.1868717876291014, 0.3740126209416783, 1.185708151408436], [-0.19126847830928265, 0.3806642145925305, 1.2046224805770356], [-0.19252452454306346, 0.3836350200765173, 1.2190499320581683], [-0.19375386812102538, 0.38526656390056524, 1.2319850831016201], [-0.19577000565042468, 0.38786277348108833, 1.244544259023476], [-0.19578626360309034, 0.39080728844869334, 1.2541442815484816], [-0.1904606955517909, 0.39057156236925006, 1.2568711881024095], [-0.17812949607789574, 0.386396752328927, 1.2517516115378622], [-0.1554991717353138, 0.38751411725048723, 1.2464854080729704], [-0.14054190267615485, 0.38965109959625444, 1.2429187280647294], [-0.1341093326330565, 0.3946431219891635, 1.2447471166798583], [-0.1283674965391831, 0.3986910598457486, 1.2447279194752603], [-0.11291293579779937, 0.3961602438241292, 1.2320979081316983], [-0.08681617256433044, 0.38820567780957144, 1.2058588018469212], [-0.049041928533934076, 0.3851984414792321, 1.174232383319323], [-0.01944197922374047, 0.3832501081952995, 1.1443523644731393], [0.0048270736283673, 0.38316350443522496, 1.1169840487976854], [0.026948240519505846, 0.38207929505746585, 1.088269301022184], [0.049656288730068554, 0.3790512095091788, 1.0548484340225799], [0.07242041500687435, 0.3748773098985555, 1.0172405762836951], [0.10369080707774363, 0.3754869146666639, 0.9775721258138039], [0.12795828013109878, 0.3753489971273798, 0.9378670991899871], [0.15109101025434335, 0.3743562350830565, 0.8947704537042432], [0.1745807480563093, 0.37275525205760285, 0.8476644237468762], [0.19849746220455441, 0.37138475941246385, 0.7971846311235886], [0.22180600031355713, 0.37027422452673775, 0.7445570114228861], [0.2682913788471472, 0.37897027283085605, 0.690009908443194], [0.2996651612301301, 0.38198175977295884, 0.6323976239289878], [0.32663859672799556, 0.38339848490232986, 0.5701793705042412], [0.3521355743183533, 0.3862071188309383, 0.5058041456764814], [0.37425830771312185, 0.3893704050835537, 0.44325246990670825], [0.39164850102128823, 0.39167430770567596, 0.3856145293368916], [0.41012692307391174, 0.3933131484754525, 0.3338836376612832]];

    const circle = new Array(41).fill().map((_, i) => [
        Math.sin(i / 20 * Math.PI),
        Math.sin(i / 20 * Math.PI),
        Math.cos(i / 20 * Math.PI)
    ])
    const spiralGalil = new Array(200).fill().map((_, i) => [
        Math.sin(i / 20 * Math.PI),
        Math.sin(i / 100 * Math.PI),
        Math.cos(i / 20 * Math.PI)
    ])

    const poo = new Array(200).fill().map((_, i) => [
        Math.sin(i / 25 * Math.PI),
        Math.sin(i / 100 * Math.PI),
        Math.cos(i / 20 * Math.PI)
    ])

    const infinityTriangle = new Array(1000).fill().map((_, i) => [
        -0.2 * Math.cos(i / 200 * Math.PI) + Math.sin(i / 100 * Math.PI) + Math.sin(i / 50 * Math.PI),
        0.1 * Math.sin(i / 200 * Math.PI) - 2 * Math.cos(i / 100 * Math.PI) + 3 * Math.sin(i / 50 * Math.PI),
        0.2 * Math.sin(i / 200 * Math.PI) + Math.sin(i / 100 * Math.PI) - Math.cos(i / 50 * Math.PI),
    ])
    const infShape = smooth(smooth(addMidpoints([
        [0, 0],
        [0, 0],
        [2, 1],
        [3, 0],
        [2, -1],
        [-2, 1],
        [-3, 0],
        [-2, -1],
        [0, 0],
        [0, 0]
    ].map(point => [
        point[0], 0, point[1] * 2
    ]), 2)))

    const locationsOptions = [
        // smallMagenDavid.concat(bigMagenDavid),
        smallMagenDavid.map(point => point.map(coord => coord / 2)),
        circle.map(point => point.map(coord => coord / 15)),
        spiralGalil.map(point => point.map(coord => coord / 20)),
        poo.map(point => point.map(coord => coord / 20)),
        infinityTriangle.map(point => point.map(coord => coord / 40)),
        infShape.map((point, idx) => [point[0], - Math.sin(idx / (infShape.length - 1) * Math.PI * 2), point[2]]).map(point => point.map(coord => coord / 30)),
        // spiral.map(point=>point.map(coord => coord/10))
    ]


    let locations = addMidpoints(locationsOptions[2], 20)


    const AIRCRAFTS_META_DATA = [
        // { id: "yasur", type: "glb", scale: 0.000007, text: "yasur" },
        // { id: "kfir", type: "glb", scale: 0.005, text: "kfir" },
        // { id: "aero", type: "glb", scale: 0.005, text: "aero" },
        // { id: "rafael", type: "gltf", scale: 0.005, text: "f99" }
        { id: "efroni", type: "glb", scale: 0.03, text: "efroni" },
        // { id: "tsofit", type: "glb", scale: 0.2, text: "tsofit" },
        { id: "f15", type: "obj", scale: 0.007, text: "f15" },
        { id: "f35", type: "glb", scale: 0.1, text: "f35" },
        { id: "f16", type: "gltf", scale: 0.005, text: "f16" },
        { id: "karnaf", type: "glb", scale: 0.035, text: "karnaf" },
        { id: "lavie", type: "glb", scale: 0.026, text: "lavie" },
    ]

    const TRAILS_META_DATA = [
        // { id: "gold", type: "obj", scale: 0.0001, text: "gold" },
        // { id: "ghost", type: "obj", scale: 0.003, text: "ghost" },
        // { id: "rainbow", type: "glb", scale: 0.03, text: "Personified Rainbow" },
        // { id: "moustache", type: "glb", scale: 0.05, text: "moustache" },
        // { id: "crown", type: "glb", scale: 0.01, text: "crown" },
        // { id: "cloud", type: "glb", scale: 0.12, text: "cloud" },
        // { id: "cheeseburger", type: "glb", scale: 0.07, text: "cheeseburger" },
        // { id: "happyface", type: "glb", scale: 0.5, text: "Happy Face" },
        // { id: "poo", type: "glb", scale: 0.5, text: "poo" },
        // { id: "disco", type: "glb", scale: 0.009, text: "Disco Ball" },
        // { id: "basketball", type: "glb", scale: 0.025, text: "Basketball" },
        // { id: "cake", type: "glb", scale: 0.04, text: "cake" },
        // { id: "present", type: "glb", scale: 0.09, text: "present" },
        { id: "heart", type: "glb", scale: 0.005, text: "heart" },
        { id: "blue", type: "obj", scale: 0.0001, text: "blue" },
        { id: "love", type: "glb", scale: 0.5, text: "love" },
        { id: "star", type: "glb", scale: 0.05, text: "star" },
        { id: "doughnut", type: "glb", scale: 0.09, text: "doughnut" },
        { id: "beachball", type: "glb", scale: 0.25, text: "beachball" },
    ]

    let mode = 'dynamic';


    function init() {

        // Detect filter change
        let isAircraftScrolling = setTimeout(() => { }, 0);
        document.getElementById('aircrafts_menu').onscroll = () => {
            clearInterval(isAircraftScrolling);
            isAircraftScrolling = setTimeout(() => {
                const centeredElement = document.elementFromPoint(
                    document.body.offsetWidth / 2, document.documentElement.clientHeight - 90
                );
                let selected = centeredElement.parentElement.innerHTML.replace('<img src="./assets/', '').replace('.png">', '');
                AIRCRAFTS_META_DATA.forEach((e) => {
                    if (e.id === selected) changeAircraft(e);
                })
            }, 100);
        }

        let isTrailScrolling = setTimeout(() => { }, 0);
        document.getElementById('trails_menu').onscroll = () => {
            clearInterval(isTrailScrolling);
            isTrailScrolling = setTimeout(() => {
                const centeredElement = document.elementFromPoint(
                    document.body.offsetWidth / 2, document.documentElement.clientHeight - 130
                );
                let selected = centeredElement.parentElement.innerHTML.replace('<img src="./assets/', '').replace('.png">', '');
                console.log(selected);
                TRAILS_META_DATA.forEach((e) => {
                    if (e.id === selected) changeTrails(e);
                })
            }, 100);
        }

        /*setTimeout(() => {
            window.scrollIntoView(document.getElementById('f35'), {
                behavior: 'smooth',
                block: 'center',
                inline: 'center'
            });
        }, 20);*/

        document.getElementById('controls').addEventListener('beforexrselect', ev => ev.preventDefault());
        document.getElementById('menus').addEventListener('beforexrselect', ev => ev.preventDefault());
        
        AIRCRAFTS_META_DATA.forEach(aircraft => {
            const elem = document.createElement('button');
            elem.classList.add("aircraft-option");
            elem.type = "button";
            elem.id = aircraft.id;
            elem.innerHTML = `<img src="./assets/${aircraft.text}.png"/>`;
            document.getElementById('aircrafts_menu').insertBefore(elem, document.getElementById('aircrafts_menu').children[1]);
            elem.addEventListener('click', (e) => {
                window.scrollIntoView(e.target, {
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'center'
                });
                changeAircraft(aircraft);
            })
        })

        TRAILS_META_DATA.forEach(trail => {
            const elem = document.createElement('button');
            elem.classList.add("trails-option");
            elem.type = "button";
            elem.id = trail.id;
            elem.innerHTML = `<img src="./assets/${trail.text}.png">`;
            document.getElementById('trails_menu').insertBefore(elem, document.getElementById('trails_menu').children[2]);
            elem.addEventListener('click', (e) => {
                window.scrollIntoView(e.target, {
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'center'
                });
                changeTrails(trail);
            })
        })

        scene = new THREE.Scene();

        clock = new THREE.Clock();

        camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
        camera.position.set(.2, .06, 0);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.xr.enabled = true;

        // environment
        let material = new THREE.MeshStandardMaterial({
            metalness: params.roughness,
            roughness: params.metalness,
            envMapIntensity: 1.0
        });

        let geometry = new THREE.PlaneGeometry(200, 200);

        material = new THREE.MeshBasicMaterial();

        planeMesh = new THREE.Mesh(geometry, material);
        planeMesh.position.y = - 50;
        planeMesh.rotation.x = - Math.PI * 0.5;
        // scene.add(planeMesh);

        THREE.DefaultLoadingManager.onLoad = function () {

            pmremGenerator.dispose();

        };

        new EXRLoader()
            .setDataType(THREE.UnsignedByteType)
            .load('assets/textures/compressed.exr', function (texture) {

                exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
                exrBackground = exrCubeRenderTarget.texture;

                texture.dispose();

            });

        new THREE.TextureLoader().load('assets/textures/equirectangular.png', function (texture) {

            texture.encoding = THREE.sRGBEncoding;

            pngCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);

            pngBackground = pngCubeRenderTarget.texture;

            texture.dispose();

        });

        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader();

        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.outputEncoding = THREE.sRGBEncoding;

        // controls
        controls = new OrbitControls(camera, renderer.domElement);
        controls.listenToKeyEvents(window); // optionalz

        container = document.createElement('div');
        container.classList.add('ar-dom-element')
        document.body.appendChild(container);
        container.appendChild(renderer.domElement);


        const arButton = ARButton.createButton(renderer, {
            optionalFeatures: ['dom-overlay', 'dom-overlay-for-handheld-ar'],
            domOverlay: { root: document.getElementById("ar-overly") },
            // endSessionCallback: startup,
            closebutton: document.getElementById("button-close")
        });

        

        window.addEventListener('load', startup, false);
        var streaming = false;

        var video = null;

        async function startup() {
            document.getElementById('aircraftInfo3D').appendChild(arButton);
        }
        // model

        document.getElementById("button-reset").addEventListener("click", () => {
            if (isSupported) {
                resetScene();
            }
            else {
                locations = addMidpoints(locationsOptions[Math.floor(Math.random() * locationsOptions.length)], 20)
                scene.remove(painter.mesh);
                loadPainter();
            }
        })

        // document.getElementById("button-close").addEventListener("click", (e) => {
        // 	closeScene();
        // })

        document.getElementById("exit-trail").addEventListener("click", (e) => {
            resetTrail();
        })

        document.getElementById('button-mode-toggle').addEventListener("click", function () {
            if (mode == 'static') {
                mode = 'dynamic';
                this.classList.add('dynamic');
                this.classList.remove('static');
                let trails_menu = document.getElementById("trails_menu");
                trails_menu.classList.remove('trails_menu_hide');
                let buttonreset = document.getElementById("resetbutton");
                buttonreset.classList.remove('trails_menu_hide');
                if (locations.length) locations.pop();
                painter.mesh.material.opacity = 0.3;
            } else {
                mode = 'static'
                this.classList.add('static');
                this.classList.remove('dynamic');
                let trails_menu = document.getElementById("trails_menu");
                trails_menu.classList.add('trails_menu_hide');
                let buttonreset = document.getElementById("resetbutton");
                buttonreset.classList.add('trails_menu_hide');
                locations.push([cursor.x, cursor.y, cursor.z]);
                painter.mesh.material.opacity = 0;
                // trails.forEach(trail => trail.children[0].children[0].material.opacity = 0)
                // trails.forEach(trail => trail.children[0].children[0].material.transparent = true)
                trails.forEach(trail => scene.remove(trail))
            }
        })

        changeAircraft(AIRCRAFTS_META_DATA[2]);
        loadLight();
        loadPainter();
        loadController();
        changeTrails(TRAILS_META_DATA[TRAILS_META_DATA.length-1]);

        window.addEventListener('resize', onWindowResize);

    }

    function createVidBackgrounds() {
        const canvas = document.createElement('canvas')
        let ctx = canvas.getContext('2d');
        let videos = document.querySelectorAll('video')
        let w, h
        for (let i = 0, len = videos.length; i < len; i++) {
            const v = videos[i]
            //debugger
            //if (!v.src) continue // no video here
            try {
                w = v.videoWidth
                h = v.videoHeight
                canvas.width = w
                canvas.height = h
                ctx.fillRect(0, 0, w, h)
                ctx.drawImage(v, 0, 0, w, h)
                document.body.style.backgroundImage = `url(${canvas.toDataURL()})` // here is the magic
                document.body.style.backgroundSize = 'cover'
                ctx.clearRect(0, 0, w, h); // clean the canvas
            } catch (e) {
                continue
            }
        }
    }

    window.setInterval(createVidBackgrounds, 30)

    function takeScreenshot() {
        const canvas = document.getElementsByTagName('canvas')[0];
        createVidBackgrounds()
        html2canvas(document.querySelector("body")).then(canvas => {
            var base64image = canvas.toDataURL("image/png");
            var iframe = "<img src='" + base64image + "'>"
            var x = window.open();
            x.document.open();
            x.document.write(iframe);
            x.document.close();
        });
    }

    function resetScene() {
        locations = [];
        scene.remove(painter.mesh);
        loadPainter();
    }

    function closeScene() {
        let newWindow = window.open("about:blank");
        window.close();
    }

    function resetTrail() {
        TRAILS_META_DATA.forEach(option => { document.getElementById(option.id).classList.remove("selected") });
        scene.remove(trails);
        trails.forEach(trail => { scene.remove(trail) });
        trails = [];
    }

    function loadController() {
        function onSelectStart(event) {
            event.inputSource

            this.userData.isSelecting = true;
            this.userData.skipFrames = 2;
            document.body.classList.add('is-selecting')
        }

        function onSelectEnd() {
            this.userData.isSelecting = false;
            document.body.classList.remove('is-selecting')
        }

        function beforeXRSelect(e) {
            e.preventDefault();
        }

        controller = renderer.xr.getController(0);
        controller.addEventListener('selectstart', onSelectStart);
        controller.addEventListener('selectend', onSelectEnd);
        controller.addEventListener('beforexrselect', beforeXRSelect)
        controller.userData.skipFrames = 0;
        scene.add(controller);
    }


    function loadAircraftGLTF(selectedAircraft) {
        new GLTFLoader()
            .load('./3d_models/aircrafts/gltf/' + selectedAircraft.id + '/object.' + selectedAircraft.type, function (gltf) {
                if (aircraft)
                    scene.remove(aircraft);
                aircraft = gltf.scene;
                animations = gltf.animations;
                const scale = selectedAircraft.scale;
                aircraft.scale.set(scale, scale, scale);
                scene.add(aircraft);

                mixer = new THREE.AnimationMixer(aircraft);

                animations.forEach(animation => {
                    action = mixer.clipAction(animation);
                    action.play();
                });

            }, undefined, function (error) {
                console.error(error);
            });
    }

    function loadAircraftOBJ(selectedAircraft) {
        new MTLLoader()
            .setPath('./3d_models/aircrafts/obj/' + selectedAircraft.id + '/')
            .load('object.mtl', function (materials) {
                materials.preload();
                new OBJLoader()
                    .setMaterials(materials)
                    .setPath('./3d_models/aircrafts/obj/' + selectedAircraft.id + '/')
                    .load('object.obj', function (object) {
                        if (aircraft)
                            scene.remove(aircraft);
                        aircraft = object;
                        const scale = selectedAircraft.scale;
                        aircraft.scale.set(scale, scale, scale);
                        scene.add(aircraft);
                    }, undefined, function (error) {
                        console.error(error);
                    });
            });
    }

    function loadPainter() {
        painter = new TubePainter();
        painter.setSize(0.1);
        painter.mesh.material.transparent = true;
        painter.mesh.material.opacity = 0.3;
        painter.mesh.material.side = THREE.DoubleSide;
        painter.moveTo(locations[0] || [0, 0, 0])
        for (let location of locations)
            painter.lineTo({
                x: location[0],
                y: location[1],
                z: location[2]
            })
        painter.update()

        scene.add(painter.mesh);
    }

    function loadAircraft(selectedAircraft) {
        if (selectedAircraft.type == "gltf" || selectedAircraft.type == "glb") {
            loadAircraftGLTF(selectedAircraft);
        } else if (selectedAircraft.type == "obj") {
            loadAircraftOBJ(selectedAircraft);
        }
    }

    function loadTrails(selectedTrails) {
        if (selectedTrails.type == "gltf" || selectedTrails.type == "glb") {
            loadTrailsGLTF(selectedTrails);
        } else if (selectedTrails.type == "obj") {
            trails.forEach(trail => { scene.remove(trail) });
            trails = []
            loadTrailsOBJ(selectedTrails);
        }
    }

    function loadTrailsGLTF(selectedTrails) {
        new GLTFLoader()
            .load('./3d_models/trails/gltf/' + selectedTrails.id + '/object.' + selectedTrails.type, function (gltf) {
                const trail = gltf.scene;
                trails.forEach(trail => { scene.remove(trail) });
                trails = [];
                for (let i = 0; i < 10; i++) {
                    const cpy = trail.clone()
                    let scale = (selectedTrails.scale * Math.abs((1 - ((i + 1) / 10)) % 1));
                    cpy.scale.set(scale, scale, scale);
                    scene.add(cpy);
                    trails.push(cpy);
                }
            }, undefined, function (error) {
                console.error(error);
            });
    }

    function loadTrailsOBJ(selectedTrails) {
        for (let i = 0; i < 9; i++) {
            new MTLLoader()
                .setPath('./3d_models/trails/obj/' + selectedTrails.id + '/')
                .load('object.mtl', function (materials) {
                    materials.preload();
                    new OBJLoader()
                        .setMaterials(materials)
                        .setPath('./3d_models/trails/obj/' + selectedTrails.id + '/')
                        .load('object.obj', function (object) {
                            const trail = object;
                            // const num = ((1 - (i / 10)) % 1) / 10000
                            const scale = (selectedTrails.scale * Math.abs((1 - ((i + 1) / 10)) % 1));
                            // const scale = selectedTrails.scale;
                            trail.scale.set(scale, scale, scale);
                            scene.add(trail);
                            trails.push(trail);
                        }, undefined, function (error) {
                            console.error(error);
                        });
                });
        }
    }

    function changeAircraft(selectedAircraft) {
        AIRCRAFTS_META_DATA.forEach(option => { document.getElementById(option.id).classList.remove("selected") });
        document.getElementById(selectedAircraft.id).classList.add("selected");
        loadAircraft(selectedAircraft);
    }

    function changeTrails(selectedTrails) {
        TRAILS_META_DATA.forEach(option => { document.getElementById(option.id).classList.remove("selected") });
        document.getElementById(selectedTrails.id).classList.add("selected");
        loadTrails(selectedTrails);
    }

    function loadLight() {

        const HemisphereLight = new THREE.HemisphereLight(0x999999, 0xbbbbff, 0.6);
        HemisphereLight.position.set(0, 1, 0);
        scene.add(HemisphereLight);

        const HemisphereLight1 = new THREE.HemisphereLight(0xffffff, 0x080820, 1);
        HemisphereLight1.position.set(5, 5, 5);
        scene.add(HemisphereLight1);

        const DirectionalLight = new THREE.DirectionalLight(0x666666, 0.5);
        DirectionalLight.position.set(5, 5, 5);
        scene.add(DirectionalLight);

        const SpotLight = new THREE.SpotLight(0xffffff, 0.1);
        SpotLight.position.set(-50, 50, 50);
        scene.add(SpotLight);

        // const LightHelper1 = new THREE.HemisphereLightHelper(HemisphereLight);
        // const LightHelper2 = new THREE.HemisphereLightHelper(HemisphereLight1);
        // const LightHelper3 = new THREE.SpotLightHelper(SpotLight);
        // const LightHelper4 = new THREE.DirectionalLightHelper(DirectionalLight);

        // scene.add(LightHelper1);
        // scene.add(LightHelper2);
        // scene.add(LightHelper3);
        // scene.add(LightHelper4);
        // scene.add(new THREE.AxesHelper(500));
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function handleController(controller) {
        const userData = controller.userData;
        const zoom = controls.target.distanceTo(controls.object.position)
        cursor.set(0, 0, - zoom).applyMatrix4(camera.matrixWorld);
        //cursor.set( 0, 0, - 0.2 ).applyMatrix4( controller.matrixWorld );

        if (userData.isSelecting === true) {
            if (userData.skipFrames >= 0) {
                // TODO(mrdoob) Revisit this

                userData.skipFrames--;
                painter.moveTo(cursor);
            } else {
                painter.lineTo(cursor);
                locations.push([cursor.x, cursor.y, cursor.z])
                painter.update();
            }
        }
    }

    function animate() {
        let render;
        render = () => isSupported ? baseRender() : iosRender();
        renderer.setAnimationLoop(render);
    }

    function renderEnvironment() {
        planeMesh.material.roughness = params.roughness;
        planeMesh.material.metalness = params.metalness;

        let newEnvMap = planeMesh.material.envMap;
        let background = scene.background;

        switch (params.envMap) {

            case 'EXR':
                newEnvMap = exrCubeRenderTarget ? exrCubeRenderTarget.texture : null;
                background = exrBackground;
                break;
            case 'PNG':
                newEnvMap = pngCubeRenderTarget ? pngCubeRenderTarget.texture : null;
                background = pngBackground;
                break;

        }

        if (newEnvMap !== planeMesh.material.envMap) {

            planeMesh.material.envMap = newEnvMap;
            planeMesh.material.needsUpdate = true;

            planeMesh.material.map = newEnvMap;
            planeMesh.material.needsUpdate = true;

        }

        planeMesh.rotation.y += 0.005;
        planeMesh.visible = params.debug;

        scene.background = background;
        renderer.toneMappingExposure = params.exposure;
    }

    function renderAircraft() {

        handleController(controller);
        if (aircraft) {
            placeAircraft();
        }
    }

    function renderAnimations() {
        delta = clock.getDelta();
        if (mixer) {
            mixer.update(delta);
        }
    }

    function baseRender() {
        renderAircraft();
        renderAnimations();
        renderer.render(scene, camera);
    }

    function iosRender() {
        renderEnvironment();
        baseRender();
    }

    function placeAircraft() {
        if (locations.length === 0) {
            aircraft?.position.set(0, 0, 0)
            aircraft?.rotation.set(0, 0, 0)
            trails.forEach(trail => trail.position.set(NaN, 0, 0))
            trails.forEach(trail => trail.rotation.set(0, 0, 0))
        } else if (locations.length === 1)
            aircraft?.position.set(...locations[0])
        else {
            if (mode == 'dynamic') {
                const smoothLocations = smooth(addMidpoints(locations, 8));
                const currentTravelPercent = getCurrentTravelPercent();
                //document.getElementById("button-reset").innerHTML = (currentTravelPercent*100).toFixed(2);
                const currLoc = currentLocationByPercent(smoothLocations, currentTravelPercent),
                    nextLoc = currentLocationByPercent(smoothLocations, currentTravelPercent + 0.01);

                aircraft?.position.set(...currLoc);
                aircraft.lookAt(...nextLoc);

                for (let i = 0; i < trails.length; i++) {
                    const currTrailLoc = currentLocationByPercent(smoothLocations, currentTravelPercent + 0.97 - (i / 50));
                    trails[i].position.set(...currTrailLoc);
                    trails[i].rotation.x += (0.01 + i / 700);
                    trails[i].rotation.y += (0.02 + i / 600);
                    trails[i].rotation.z += (0.03 + i / 500);
                }
            } else {
                aircraft?.position.set(...locations[locations.length - 1]);
                aircraft.rotation.set(0, 0, 0);
            }
        }
    }

    function smooth(locations) {
        let result = [locations[0]];
        for (let i = 1; i < locations.length - 1; i++) {
            result.push(
                [
                    (locations[i - 1][0] + locations[i][0] + locations[i + 1][0]) / 3,
                    (locations[i - 1][1] + locations[i][1] + locations[i + 1][1]) / 3,
                    (locations[i - 1][2] + locations[i][2] + locations[i + 1][2]) / 3
                ]
            );
        }
        result.push(locations[locations.length - 1])
        return result;
    }

    function addMidpoints(locations, iterations = 1) {
        let result = [locations[0]];
        for (let i = 1; i < locations.length; i++) {
            result.push(
                [
                    (locations[i - 1][0] + locations[i][0]) / 2,
                    (locations[i - 1][1] + locations[i][1]) / 2,
                    (locations[i - 1][2] + locations[i][2]) / 2
                ],
                locations[i]
            );
        }
        if (iterations > 1)
            return addMidpoints(locations, iterations - 1)
        return result;
    }

    function currentLocationByPercent(locations, percent) {
        if (percent >= 1) return currentLocationByPercent(locations, percent % 1)
        if (percent < 0) return currentLocationByPercent(locations, (percent + 100) % 1)

        const totalLen = travelLength(locations);
        let idx, sum = 0;
        for (idx = 0; idx <= locations.length && sum <= totalLen * percent; idx++) {
            sum += oclidianDistance(locations[idx], locations[(idx + 1) % locations.length])
        }
        if (!locations[idx % locations.length] || !locations[(idx + 1) % locations.length]) {
            debugger
            idx = 0;
        }
        const r = (sum - totalLen * percent) / oclidianDistance(locations[idx - 1], locations[idx % locations.length])

        return locations[idx % locations.length].map((val, axis) => val * r + locations[(idx + 1) % locations.length][axis] * (1 - r))
    }

    function getCurrentTravelPercent() {
        const totalMillis = travelLength(locations) * 5000;
        if (Date.now() - animationCycleStart > totalMillis)
            animationCycleStart = Date.now();

        return (Date.now() - animationCycleStart) / totalMillis;
    }

    function travelLength(locations) {
        let result = 0;
        for (let i = 0; i < locations.length; i++) {
            result += oclidianDistance(locations[i], locations[(i + 1) % locations.length])
        }
        return result;
    }

    function oclidianDistance([x0, y0, z0], [x1, y1, z1]) {
        return Math.sqrt(
            Math.pow(x1 - x0, 2) +
            Math.pow(y1 - y0, 2) +
            Math.pow(z1 - z0, 2)
        )
    }

    window.finishTutorial = function (stepFinished) {
        stepFinished = Number(stepFinished)
        document.querySelector('.step-' + stepFinished).style.display = 'none';
        const nextElem = document.querySelector('.step-' + (stepFinished + 1));
        if (nextElem) {
            nextElem.style.display = 'block';
        } else {
            document.getElementById('tutorial').style.display = 'none'
        }
        document.cookie = "tutorial=" + stepFinished + "; expires=Thu, 30 Dec 2021 12:00:00 UTC";
    }

    if (getCookie('tutorial')) {
        const stepFinished = getCookie('tutorial');
        document.querySelector('.step-1').style.display = 'none';
        finishTutorial(stepFinished)
    }

    function getCookie(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }


    /******************** Easter Egg *************************/

    {
        let counter = 0;
        document.querySelector('#button-mode-toggle').addEventListener('click', e => {
            if (counter++ >= 20) {
                loadAircraft({ id: "bee", type: "glb", scale: 0.15, text: "karnaf" })
                counter = 0;
            }
        })

    }

    let isSupported;
    if ('xr' in navigator && navigator.xr.isSessionSupported) {
        navigator.xr.isSessionSupported('immersive-ar').then(function (supported) {
            isSupported = supported;
        }).catch();
    } else isSupported = false;

    init();
    animate();

}, 100)