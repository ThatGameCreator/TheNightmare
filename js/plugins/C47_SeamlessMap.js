//=============================================================================
// C47_SeamlessMap.js
//=============================================================================

var Imported = Imported || {};
Imported.C47_SeamlessMap = "1.0.6";

var C47 = C47 || {};
C47.SeamlessMap = C47.SeamlessMap || {};

//=============================================================================
/*:zh
 * @plugindesc Ver 1.0.6 大地图无缝衔接转场，使角色在多张地图间移动时感觉像在一张地图上
 *
 * @author chyj4747 & Lanza Schneider
 *
 * @param Do clear old tileset
 * @desc true / false，加载新地图的图集时是否先清理掉老的图集，若渲染地图没发现什么问题不建议打开，清理会耗时
 * @default false
 * 
 * @param Min tile to check
 * @desc 数字，可小数，最小值0，遇到边界时，提前多少格子判断是否需要加载相邻地图，默认0.5个格子
 * @default 0.5
 *
 * @help 
 * =~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~
 * 插件说明
 * =~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~
 * 地图属性中备注的格式如下：
 * <cmap:方位1 地图ID X Y 方位2 地图ID X Y 方位3...>
 * 
 * cmap：connect map的缩写，本插件使用的关键词
 * 方位：代表相邻地图的位置，上u下d左l右r
 * 地图ID：所在方位的相邻地图的ID
 * X: 当前地图与相邻地图连接的X坐标
 * Y: 与X同理，Y坐标
 * X和Y没看懂的看下面
 * （方位 地图ID X Y）为一组数据，要么一起出现，要么就不写，也就是某个
 * 方位若没有相连的地图，那就不写
 * 
 * 案例：
 * 现有三张地图，地图1、地图2、地图3
 * 地图1备注：<cmap:u 2 3 0 r 3 5 2>
 * 地图2备注：<cmap:d 1 4 7>
 * 地图3备注：<cmap:l 1 0 4>
 * 首先，地图1连接了两张地图，其备注中“u 2 3 0”表示上方(u)连接ID为2的
 * 地图，用于跟地图2相连的坐标为（3,0），对应的，地图2的备注表示下方(d)
 * 连接ID为1的地图，用于跟地图1相连的坐标为（4,7）
 * 地图1的“r 3 5 2”与地图3的“l 1 0 4”也是对应关系，两者左右相连
 * 
 * 最终
 * 地图2底边的（4,7）就在地图1顶边的（3,0）的正上方
 * 地图3左边的（0,4）就在地图1右边的（5,2）的正右方
 * 
 * 相连的点的坐标可以在MV的地图编辑器下方查看，鼠标选中一个图块就会显
 * 示其坐标
 * 
 * 其它注意事项：
 * · 只能额外显示一张地图，所以尽量不要让人物能够走到地图角落，那样只会
 *   根据最近的距离显示一张相邻地图，距离相等则按照左下右上的顺序显示
 * · 本插件使用后，相机自动对准主角，即主角永远在屏幕中心
 * · 改写了一部分地图相关的核心代码，不保证其它插件的兼容性
 * · 只有当前主角所在地图的事件会生效，相邻地图只是绘制出来而已，不会运
 *   作，虽然可以使其运作，但仔细考虑之后还是不实现此功能，否则作者设计
 *   的进入地图触发就错乱了
 * · 本插件不会影响正常的转场，比如从大地图进入室内时切换地图，可以用转
 *   场动作常规操作
 * · 有拼接的地图不要设置无限滚动，应该会冲突的，话说都拼接了还无限滚动
 *   个啥
 * · 主角进入相邻地图时，跟随者也会一并进入，也就是即便跟随者还显示在主
 *   地图上，他们也已经进入了相邻地图
 * · 没有处理远景
 * · 没有考虑载具，船、飞行器啥的，使用载具可能出现未知问题
 * · 没有处理斜对角移动
 * 
 * 最后感谢Lanza Schneider解决了双地图渲染严重卡顿的问题
 */
/*:
 * @plugindesc Ver 1.0.6 Seamless map transfer. Render two different maps. 
 *
 * @author chyj4747 & Lanza Schneider
 *
 * @param Do clear old tileset
 * @desc true / false. Clean old tileset when rendering new tilemap each frame. No need to use.
 * @default false
 * 
 * @param Min tile to check
 * @desc Float. Min 0. The min distance to the border of map to show connected map. Default 0.5 tile.
 * @default 0.5
 *
 * @help 
 * =~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~
 * Intro
 * =~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~
 * First of all, I am Chinese, so sorry if I don't explain something clearly.
 * 
 * Note format of map:
 * <cmap:DIR1 MAP_ID X Y DIR2 MAP_ID X Y DIR3...>
 * 
 * cmap: short for "connect map"
 * DIR: in which direction the next map will be connected.
 *      l d r u for left down right up.
 * MAP_ID: the id of connected map in the given direction.
 * X and Y: coordinates of current map used to connect next map.
 * See example below if you don't understand.
 * (DIR MAP_ID X Y) is a combination, must appear together.
 * 
 * Example:
 * Three maps, map1, map2, map3
 * Map1 note: <cmap:u 2 3 0 r 3 5 2>
 * Map2 note: <cmap:d 1 4 7>
 * Map3 note: <cmap:l 1 0 4>
 * 
 * Map1's "u 2 3 0" and Map2's "d 1 4 7" mean map2 will be on top 
 * of map1, and (3,0) of map1 will be connected to (4,7) of map2
 * 
 * Map1's "r 3 5 2" and Map3's "l 1 0 4" mean map3 will be at right
 * side of map1, and (5,2) of map1 will be connected to (0,4) of map3
 * 
 * You can easily find the coordinates of any tile at the bottom of map editor.
 * 
 * Notice:
 * · Can only render two maps. Don't let your actor move to the corner of map.
 *   Otherwise only the nearest map will be showed. In case of same distance,
 *   it will be showed in the order left down right up.
 * · Once this plugin is used, the main actor is always in the center of screen.
 * · May cause conflicts with other map plugins. Eg. camera plugin.
 * · Only the events in current map will run. Those events in the connected map
 *   will be drew but cannot run.
 * · You can use map transfer normally.
 * · Don't use map loop if the map is connected to any other maps.
 * · When the main actor moves into new map, the flowers are all "moved" into 
 *   that map, although it looks they are not really in the area of new map.
 * · Parallex is not handled.
 * · Vehicle is not handled.
 * · Diagonally move is not handled.
 * 
 * Finally thank Lanza Schneider for giving me a solution of solving the heavy 
 * lag problem when rendering two maps.
 */

var $dataMap2 = null;

(function() {
    'use strict';
    //=============================================================================
    // 插件变量
    //=============================================================================
    C47.POS_NONE  = -1;
    C47.POS_LEFT  = 0;
    C47.POS_DOWN  = 1;
    C47.POS_RIGHT = 2;
    C47.POS_UP    = 3;

    C47.NOTE_MAP_KEY       = "cmap";
    C47.NOTE_MAP_KEY_LEFT  = "l";
    C47.NOTE_MAP_KEY_DOWN  = "d";
    C47.NOTE_MAP_KEY_RIGHT = "r";
    C47.NOTE_MAP_KEY_UP    = "u";
    C47.NOTE_PAIR_LEN      = 4; // 指令组长度（方位 地图ID X Y）

    C47.SeamlessMap._isMap2Needed = false;     // 是否需要渲染地图2
    C47.SeamlessMap._RequiredBindData1 = null; // 需要加载的地图1纹理数据集，是个纹理数据集合，若标记为true，只是简单的不进行renderWebGL渲染
    C47.SeamlessMap._RequiredBindData2 = null; // 需要加载的地图2纹理数据集，是个纹理数据集合，若标记为true，只是简单的不进行renderWebGL渲染
    C47.SeamlessMap._SceneManager = null;      // 加载纹理数据后需要回调场景管理器
    C47.SeamlessMap._isFirstFrameAfterLoadData = false; // 加载纹理后的第一次渲染会黑屏一下，原因不明，因此用此变量跳过第一次渲染
    C47.SeamlessMap._loadedMapFile = null;     // 已读取的地图2文件
    C47.SeamlessMap._loadedTileset2Id = 0;     // 已读取的地图2瓦片图集ID
    C47.SeamlessMap._LoadedBindData1 = null;   // 切换地图时用于直接加载的纹理数据，不等Graphics.render时再去判断，否则会渲染失败一帧
    C47.SeamlessMap._LoadedBindData2 = null;   // 切换地图时用于直接加载的纹理数据，不等Graphics.render时再去判断，否则会渲染失败一帧
    C47.SeamlessMap._isSwitchingMap = false;   // 是否正在切换地图

    //=============================================================================
    // 插件配置
    //=============================================================================
    var parameters      = $plugins.filter(function(p){return p.name === "C47_SeamlessMap"})[0].parameters;
    var p_DoClear       = Boolean(parameters['Do clear old tileset'] === 'true' || false);
    var p_MinCheckDist  = parseFloat(parameters['Min tile to check']);
    if (isNaN(p_MinCheckDist) || p_MinCheckDist < 0) p_MinCheckDist = 0;

    //=============================================================================
    // 插件方法
    //=============================================================================
    C47.SeamlessMap.NeedMap2 = function(isNeeded) {
        this._isMap2Needed = isNeeded;
    }

    C47.SeamlessMap.IsMap2Needed = function() {
        return this._isMap2Needed;
    }

    // 读取主地图备注
    C47.SeamlessMap.ReadNote = function() {
        if (!$gameMap || !$dataMap || !$dataMap.meta) return;

        let note = $dataMap.meta;
        if (!note.cmap) return;

        let settings = note.cmap.trim().split(" ");
        if (settings.length % C47.NOTE_PAIR_LEN != 0) return;

        // 清理地图相连数据
        $gameMap._conenctMapIds = [0,0,0,0];

        // 读取备注
        let count = parseInt(settings.length / C47.NOTE_PAIR_LEN);
        for (var i = 0; i < count; i++)
        {
            let dir = settings[i * C47.NOTE_PAIR_LEN];
            let mapId = parseInt(settings[i * C47.NOTE_PAIR_LEN + 1]);
            let x = parseInt(settings[i * C47.NOTE_PAIR_LEN + 2]);
            let y = parseInt(settings[i * C47.NOTE_PAIR_LEN + 3]);
            if (dir == C47.NOTE_MAP_KEY_LEFT) dir = C47.POS_LEFT;
            else if (dir == C47.NOTE_MAP_KEY_DOWN) dir = C47.POS_DOWN;
            else if (dir == C47.NOTE_MAP_KEY_RIGHT) dir = C47.POS_RIGHT;
            else if (dir == C47.NOTE_MAP_KEY_UP) dir = C47.POS_UP;
            $gameMap.setConnectMap(dir, mapId, x, y);
        }
    }

    // 读取相连地图备注
    C47.SeamlessMap.ReadNote2 = function() {
        if (!C47.SeamlessMap.IsMap2Needed() || !$dataMap2 || !$dataMap.meta) return;

        let note = $dataMap2.meta;
        if (!note.cmap) return;

        if ($gameMap._map2Pos == C47.POS_NONE) return;

        let settings = note.cmap.trim().split(" ");
        if (settings.length % C47.NOTE_PAIR_LEN != 0) return;

        let map1Dir = ($gameMap._map2Pos + 2) % 4; // 主地图对于相连地图的方位
        let count = parseInt(settings.length / C47.NOTE_PAIR_LEN);
        for (var i = 0; i < count; i++)
        {
            let dir = settings[i * C47.NOTE_PAIR_LEN];
            let mapId = parseInt(settings[i * C47.NOTE_PAIR_LEN + 1]);
            let x = parseInt(settings[i * C47.NOTE_PAIR_LEN + 2]);
            let y = parseInt(settings[i * C47.NOTE_PAIR_LEN + 3]);
            if (dir == C47.NOTE_MAP_KEY_LEFT) dir = C47.POS_LEFT;
            else if (dir == C47.NOTE_MAP_KEY_DOWN) dir = C47.POS_DOWN;
            else if (dir == C47.NOTE_MAP_KEY_RIGHT) dir = C47.POS_RIGHT;
            else if (dir == C47.NOTE_MAP_KEY_UP) dir = C47.POS_UP;
            if (dir == map1Dir && mapId == $gameMap.mapId()) {
                $gameMap.setMap2ConnectXY(x, y);
                break;
            }
        }
    }

    // 加载地图所需纹理
    C47.SeamlessMap.DoBindTexture = function() {
        if (C47.SeamlessMap._RequiredBindData1) {
            let data = C47.SeamlessMap._RequiredBindData1;
            let ret = C47.SeamlessMap.BindTextures(data.tile, data.renderer, data.textures);
            if (ret) {
                C47.SeamlessMap._LoadedBindData1 = C47.SeamlessMap._RequiredBindData1;
                C47.SeamlessMap._RequiredBindData1 = null;
                C47.SeamlessMap._isFirstFrameAfterLoadData = true;
            }
            if (!C47.SeamlessMap._isSwitchingMap) C47.SeamlessMap._SceneManager.requestUpdate();
        }
        else if (C47.SeamlessMap._RequiredBindData2) {
            let data = C47.SeamlessMap._RequiredBindData2;
            let ret = C47.SeamlessMap.BindTextures(data.tile, data.renderer, data.textures);
            if (ret) {
                C47.SeamlessMap._LoadedBindData2 = C47.SeamlessMap._RequiredBindData2;
                C47.SeamlessMap._RequiredBindData2 = null;
                C47.SeamlessMap._isFirstFrameAfterLoadData = true;
            }
            if (!C47.SeamlessMap._isSwitchingMap) C47.SeamlessMap._SceneManager.requestUpdate();
        }
    }

    // 拷贝pixi-tilemap.js内部函数，以提供此插件外部调用
    function _hackSubImage(tex, sprite, clearBuffer, clearWidth, clearHeight) {
        var gl = tex.gl;
        var baseTex = sprite.texture.baseTexture;
        if (clearBuffer && clearWidth > 0 && clearHeight > 0) {
            gl.texSubImage2D(gl.TEXTURE_2D, 0, sprite.position.x, sprite.position.y, clearWidth, clearHeight, tex.format, tex.type, clearBuffer);
        }
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, sprite.position.x, sprite.position.y, tex.format, tex.type, baseTex.source);
    }

    // 实际操作纹理加载
    C47.SeamlessMap.BindTextures = function (tileRenderer, renderer, textures) {
        var bounds = tileRenderer.boundSprites;
        var glts = tileRenderer.glTextures;
        var len = textures.length;
        var maxTextures = tileRenderer.maxTextures;
        if (len > 4 * maxTextures) {
            return true;
        }
        var doClear = p_DoClear;
        if (doClear && !tileRenderer._clearBuffer) {
            tileRenderer._clearBuffer = new Uint8Array(1024 * 1024 * 4);
        }
        var i;
        for (i = 0; i < len; i++) {
            var texture = textures[i];
            if (!texture || !textures[i].valid)
                return false;
            var bs = bounds[i >> 2][i & 3];
            if (!bs.texture ||
                bs.texture.baseTexture !== texture.baseTexture) {
                bs.texture = texture;
                var glt = glts[i >> 2];
                renderer.bindTexture(glt, 0, true);
                if (doClear) {
                    _hackSubImage(glt.baseTexture._glTextures[renderer.CONTEXT_UID], bs, tileRenderer._clearBuffer, 1024, 1024);
                }
                else {
                    _hackSubImage(glt.baseTexture._glTextures[renderer.CONTEXT_UID], bs);
                }
            }
        }

        return true;
    };

    // 是否有纹理数据需要加载
    C47.SeamlessMap.HasRequiredBindData = function() {
        return C47.SeamlessMap._RequiredBindData1 || C47.SeamlessMap._RequiredBindData2;
    }

    C47.SeamlessMap.IsRequiredBindDataReadyToLoad = function(data) {
        if (!data) return false;

        var textures = data.textures;
        var len = textures.length;
        for (var i = 0; i < len; i++) {
            var texture = textures[i];
            if (!texture || !textures[i].valid)
                return false;
        }

        return true;
    }

    // 交换地图1和地图2
    C47.SeamlessMap.SwitchMaps = function() {
        let tmp = $dataMap2;
        $dataMap2 = $dataMap;
        $dataMap = tmp;

        DataManager.onLoad($dataMap);

        tmp = $gameMap._mapId;
        $gameMap._mapId = $gameMap._map2Id;
        $gameMap._map2Id = tmp;

        $gameMap._tileset2Id = $gameMap.tilesetId();
        $gameMap._map2Pos = ($gameMap._map2Pos + 2) % 4;

        // 替换已加载的地图文件名，避免重复加载
        C47.SeamlessMap._loadedMapFile = 'Map%1.json'.format($gameMap._map2Id.padZero(3));
        C47.SeamlessMap._loadedTileset2Id = $gameMap._tileset2Id;

        // 设置主地图
        $gameMap.setup($gameMap._mapId);
    }

    //=============================================================================
    // Game_Map 重载
    //=============================================================================
    var _Game_Map_prototype_initialize = Game_Map.prototype.initialize;
    Game_Map.prototype.initialize = function() {
        this._map2Id = 0;
        this._tileset2Id = 0;
        this._map2Pos = C47.POS_NONE;
        this._displayX2 = 0; // 相连地图显示坐标X
        this._displayY2 = 0; // 相连地图显示坐标Y
        this._map2ConnectX = 0; // 相连地图对齐坐标X
        this._map2ConnectY = 0; // 相连地图对齐坐标Y
        this._conenctMapIds = [0,0,0,0]; // 连接地图的ID，顺序：左下右上
        this._connectX = [-1,-1,-1,-1]; // 与相连地图对齐的坐标X（当前地图的点）
        this._connectY = [-1,-1,-1,-1]; // 与相连地图对齐的坐标Y（当前地图的点）
        this._events2 = []; // 相邻地图事件
        _Game_Map_prototype_initialize.call(this);
    };

    var _Game_Map_prototype_setup = Game_Map.prototype.setup;
    Game_Map.prototype.setup = function(mapId) {
        C47.SeamlessMap.ReadNote();
        _Game_Map_prototype_setup.apply(this, arguments);
    };

    Game_Map.prototype.setDisplayPos = function(x, y) {
        this._displayX = x;
        this._parallaxX = x;
        this._displayY = y;
        this._parallaxY = y;
    };

    Game_Map.prototype.scrollDown = function(distance) {
        this._displayY += distance;
        this._displayY2 += distance;
        this._parallaxY += distance;
    };
    
    Game_Map.prototype.scrollLeft = function(distance) {
        this._displayX -= distance;
        this._displayX2 -= distance;
        this._parallaxX -= distance;
    };
    
    Game_Map.prototype.scrollRight = function(distance) {
        this._displayX += distance;
        this._displayX2 += distance;
        this._parallaxX += distance;
    };
    
    Game_Map.prototype.scrollUp = function(distance) {
        this._displayY -= distance;
        this._displayY2 -= distance;
        this._parallaxY -= distance;
    };

    Game_Map.prototype.isValid = function(x, y) {
        if (x < 0) return this._conenctMapIds[C47.POS_LEFT] > 0;
        else if (x >= this.width()) return this._conenctMapIds[C47.POS_RIGHT] > 0;
        else if (y < 0) return this._conenctMapIds[C47.POS_UP] > 0;
        else if (y >= this.height()) return this._conenctMapIds[C47.POS_DOWN] > 0;
        return true;
    };

    var _Game_Map_prototype_checkPassage = Game_Map.prototype.checkPassage;
    Game_Map.prototype.checkPassage = function(x, y, bit) {
        var map2Dir = this._map2Pos;
        if (x < 0) {
            if (map2Dir != C47.POS_LEFT) return false;
            if (this._conenctMapIds[C47.POS_LEFT] > 0) {
                x += this._map2ConnectX - this._connectX[C47.POS_LEFT] + 1;
                y += this._map2ConnectY - this._connectY[C47.POS_LEFT];
                return this.checkMap2Passage(x, y, bit);
            }
            return false;
        }
        else if (x >= this.width()) {
            if (map2Dir != C47.POS_RIGHT) return false;
            if (this._conenctMapIds[C47.POS_RIGHT] > 0) {
                x += this._map2ConnectX - this._connectX[C47.POS_RIGHT] - 1;
                y += this._map2ConnectY - this._connectY[C47.POS_RIGHT];
                return this.checkMap2Passage(x, y, bit);
            }
            return false;
        }
        else if (y < 0) {
            if (map2Dir != C47.POS_UP) return false;
            if (this._conenctMapIds[C47.POS_UP] > 0) {
                x += this._map2ConnectX - this._connectX[C47.POS_UP];
                y += this._map2ConnectY - this._connectY[C47.POS_UP] + 1;
                return this.checkMap2Passage(x, y, bit);
            }
            return false;
        }
        else if (y >= this.height()) {
            if (map2Dir != C47.POS_DOWN) return false;
            if (this._conenctMapIds[C47.POS_DOWN] > 0) {
                x += this._map2ConnectX - this._connectX[C47.POS_DOWN];
                y += this._map2ConnectY - this._connectY[C47.POS_DOWN] - 1;
                return this.checkMap2Passage(x, y, bit);
            }
            return false;
        }
        return _Game_Map_prototype_checkPassage.apply(this, arguments);
    }

    var _Game_Map_prototype_refresh = Game_Map.prototype.refresh;
    Game_Map.prototype.refresh = function() {
        this.events2().forEach(function(event) {
            event.refresh();
        });
        _Game_Map_prototype_refresh.call(this);
    };
    
    var _Game_Map_prototype_updateEvents = Game_Map.prototype.updateEvents;
    Game_Map.prototype.updateEvents = function() {
        this.events2().forEach(function(event) {
            event.update();
        });
        _Game_Map_prototype_updateEvents.call(this);
    };

    //=============================================================================
    // Game_Map 新增
    //=============================================================================
    Game_Map.prototype.map2Id = function() {
        return this._map2Id;
    };

    Game_Map.prototype.setTileset2Id = function(tid) {
        this._tileset2Id = tid;
    }
    
    Game_Map.prototype.tileset2Id = function() {
        return this._tileset2Id;
    };

    Game_Map.prototype.tileset2 = function() {
        return $dataTilesets[this._tileset2Id];
    };

    Game_Map.prototype.tileset2Flags = function() {
        var tileset = this.tileset2();
        if (tileset) {
            return tileset.flags;
        } else {
            return [];
        }
    };

    Game_Map.prototype.width2 = function() {
        return $dataMap2.width;
    };
    
    Game_Map.prototype.height2 = function() {
        return $dataMap2.height;
    };

    Game_Map.prototype.displayX2 = function() {
        return this._displayX2;
    }

    Game_Map.prototype.displayY2 = function() {
        return this._displayY2;
    }
    
    Game_Map.prototype.data2 = function() {
        return $dataMap2.data;
    };

    Game_Map.prototype.setMap2ConnectXY = function(x, y) {
        this._map2ConnectX = x;
        this._map2ConnectY = y;
        this.initMap2XY();
    }

    Game_Map.prototype.initMap2XY = function() {
        this._displayX2 = this._displayX + this._map2ConnectX - this._connectX[this._map2Pos];
        this._displayY2 = this._displayY + this._map2ConnectY - this._connectY[this._map2Pos];
        if (this._map2Pos == C47.POS_LEFT) this._displayX2++;
        else if (this._map2Pos == C47.POS_DOWN) this._displayY2--;
        else if (this._map2Pos == C47.POS_RIGHT) this._displayX2--;
        else if (this._map2Pos == C47.POS_UP) this._displayY2++;
    }

    // 参数：方位，地图ID，对齐坐标X，对齐坐标Y
    Game_Map.prototype.setConnectMap = function(dir, mapId, x, y) {
        if (dir == C47.POS_NONE) return;
        this._conenctMapIds[dir] = mapId;
        this._connectX[dir] = x;
        this._connectY[dir] = y;
    }

    // 检测是否需要加载衔接地图，需要的话返回衔接地图的方位
    Game_Map.prototype.checkMap2Dir = function() {
        let minDir = C47.POS_NONE;
        let dist = [999,999,999,999]; // 人物距离地图左下右上边界的距离
        let needToShow = []; // 左下右上地图2是否需要显示
        let screenTileWidth = Math.floor(Graphics.width / this.tileWidth()) - 1;
        let screenTileHeight = Math.floor(Graphics.height / this.tileHeight()) - 1;
        let playerX = this._displayX + Math.floor(screenTileWidth / 2); // 玩家在当前地图的坐标X
        let playerY = this._displayY + Math.floor(screenTileHeight / 2); // 玩家在当前地图的坐标Y
        let borderX = this.width() - 1;
        let borderY = this.height() - 1;

        // 检测必须要显示的地图
        if (this._conenctMapIds[C47.POS_LEFT] > 0 && this._displayX < 0) {
            needToShow.push(C47.POS_LEFT);
        }
        if (this._conenctMapIds[C47.POS_DOWN] > 0 && this._displayY + screenTileHeight > borderY) {
            needToShow.push(C47.POS_DOWN);
        }
        if (this._conenctMapIds[C47.POS_RIGHT] > 0 && this._displayX + screenTileWidth > borderX) {
            needToShow.push(C47.POS_RIGHT);
        }
        if (this._conenctMapIds[C47.POS_UP] > 0 && this._displayY < 0) {
            needToShow.push(C47.POS_UP);
        }

        if (needToShow.length == 1) minDir = needToShow[0]; // 只有一个方向的地图需要显示
        else {
            if (this._conenctMapIds[C47.POS_LEFT] > 0 && this._displayX < p_MinCheckDist) {
                dist[C47.POS_LEFT] = playerX;
            }
            if (this._conenctMapIds[C47.POS_DOWN] > 0 && this._displayY + screenTileHeight > borderY + p_MinCheckDist) {
                dist[C47.POS_DOWN] = borderY - playerY;
            }
            if (this._conenctMapIds[C47.POS_RIGHT] > 0 && this._displayX + screenTileWidth > borderX + p_MinCheckDist) {
                dist[C47.POS_RIGHT] = borderX - playerX;
            }
            if (this._conenctMapIds[C47.POS_UP] > 0 && this._displayY < p_MinCheckDist) {
                dist[C47.POS_UP] = playerY;
            }
            // 判断距离哪个边界最近
            let minDist = 999;
            for (var i = 0; i < 4; i++) {
                if (dist[i] < minDist) {
                    minDist = dist[i];
                    minDir = i;
                }
            }
        }
        if (minDir != C47.POS_NONE) C47.SeamlessMap.NeedMap2(true);
        return minDir;
    }

    // 显示指定方位的衔接地图
    Game_Map.prototype.showMap2 = function(dir) {
        if (!C47.SeamlessMap.IsMap2Needed()) return;
        if (this._conenctMapIds[dir] == 0) return;
        if (this._map2Pos != dir)
        {
            this._map2Pos = dir;
            DataManager.loadMap2Data(this._conenctMapIds[dir]);
        }
    }

    // 初始化地图2事件
    Game_Map.prototype.setupEvents2 = function() {
        this._events2 = [];
        for (var i = 0; i < $dataMap2.events.length; i++) {
            if ($dataMap2.events[i]) {
                this._events2[i] = new Game_Event2(this._map2Id, i);
            }
        }
        this.refreshTileEvents2();
    };

    Game_Map.prototype.events2 = function() {
        return this._events2.filter(function(event) {
            return !!event;
        });
    };

    Game_Map.prototype.refreshTileEvents2 = function() {
        this.tileEvents2 = this.events2().filter(function(event) {
            return event.isTile();
        });
    };

    // 检查地图2图块是否可通行，仅用于跨地图检测
    Game_Map.prototype.checkMap2Passage = function(x, y, bit) {
        var flags = this.tileset2Flags();
        var tiles = this.allTiles2(x, y);
        for (var i = 0; i < tiles.length; i++) {
            var flag = flags[tiles[i]];
            if ((flag & 0x10) !== 0)  // [*] No effect on passage
                continue;
            if ((flag & bit) === 0)   // [o] Passable
                return true;
            if ((flag & bit) === bit) // [x] Impassable
                return false;
        }
        return false;
    };

    Game_Map.prototype.allTiles2 = function(x, y) {
        var tiles = this.tileEvents2Xy(x, y).map(function(event) {
            return event.tileId();
        });
        return tiles.concat(this.layeredTiles2(x, y));
    };

    Game_Map.prototype.tileEvents2Xy = function(x, y) {
        if (!this.tileEvents2) return [];
        return this.tileEvents2.filter(function(event) {
            return event.posNt(x, y);
        });
    };

    Game_Map.prototype.tile2Id = function(x, y, z) {
        var width = $dataMap2.width;
        var height = $dataMap2.height;
        return $dataMap2.data[(z * height + y) * width + x] || 0;
    };
    
    Game_Map.prototype.layeredTiles2 = function(x, y) {
        var tiles = [];
        for (var i = 0; i < 4; i++) {
            tiles.push(this.tile2Id(x, y, 3 - i));
        }
        return tiles;
    };

    Game_Map.prototype.events2XyNt = function(x, y) {
        return this.events2().filter(function(event) {
            return event.posNt(x, y);
        });
    };

    //=============================================================================
    // Game_CharacterBase 重载
    //=============================================================================
    var _Game_CharacterBase_prototype_isCollidedWithCharacters = Game_CharacterBase.prototype.isCollidedWithCharacters;
    Game_CharacterBase.prototype.isCollidedWithCharacters = function(x, y) {
        if (x < 0) {
            if ($gameMap._conenctMapIds[C47.POS_LEFT] > 0) return this.isCollidedWithEvents2(x, y);
            return false;
        }
        else if (x >= $gameMap.width()) {
            if ($gameMap._conenctMapIds[C47.POS_RIGHT] > 0) return this.isCollidedWithEvents2(x, y);
            return false;
        }
        else if (y < 0) {
            if ($gameMap._conenctMapIds[C47.POS_UP] > 0) return this.isCollidedWithEvents2(x, y);
            return false;
        }
        else if (y >= $gameMap.height()) {
            if ($gameMap._conenctMapIds[C47.POS_DOWN] > 0) return this.isCollidedWithEvents2(x, y);
            return false;
        }
        return _Game_CharacterBase_prototype_isCollidedWithCharacters.apply(this, arguments);
    };

    //=============================================================================
    // Game_CharacterBase 新增
    //=============================================================================
    Game_CharacterBase.prototype.isCollidedWithEvents2 = function(x, y) {
        var events = $gameMap.events2XyNt(x, y);
        return events.some(function(event) {
            return event.isNormalPriority();
        });
    };

    //=============================================================================
    // Game_Player 重载
    //=============================================================================
    Game_Player.prototype.updateScroll = function(lastScrolledX, lastScrolledY) {
        var x1 = lastScrolledX;
        var y1 = lastScrolledY;
        var x2 = this.scrolledX();
        var y2 = this.scrolledY();
        if (y2 > y1 && y2 > this.centerY()) {
            $gameMap.scrollDown(y2 - y1);
        }
        if (x2 < x1 && x2 < this.centerX()) {
            $gameMap.scrollLeft(x1 - x2);
        }
        if (x2 > x1 && x2 > this.centerX()) {
            $gameMap.scrollRight(x2 - x1);
        }
        if (y2 < y1 && y2 < this.centerY()) {
            $gameMap.scrollUp(y1 - y2);
        }

        let map2Dir = $gameMap.checkMap2Dir();
        if (map2Dir != C47.POS_NONE) {
            $gameMap.showMap2(map2Dir);
        }
        else $gameMap._map2Pos = C47.POS_NONE;
    };

    var _Game_Player_prototype_increaseSteps = Game_Player.prototype.increaseSteps;
    Game_Player.prototype.increaseSteps = function() {
        var map2Dir = $gameMap._map2Pos;
        if (C47.SeamlessMap.IsMap2Needed() && 
            ((this._x < 0 && map2Dir == C47.POS_LEFT) || 
             (this._x >= $gameMap.width() && map2Dir == C47.POS_RIGHT) || 
             (this._y < 0 && map2Dir == C47.POS_UP) || 
             (this._y >= $gameMap.height() && map2Dir == C47.POS_DOWN)))
        {
            this.performTransferToMap2();
        }
        _Game_Player_prototype_increaseSteps.call(this);
    }

    //=============================================================================
    // Game_Player 新增
    //=============================================================================
    Game_Player.prototype.performTransferToMap2 = function() {
        // 先计算换地图后人物对于新的主地图的坐标
        let newX = this._realX;
        let newY = this._realY;
        let dx = 0;
        let dy = 0;
        if (this._x < 0) {
            dx = $gameMap.width2();
            dy = $gameMap._map2ConnectY - $gameMap._connectY[C47.POS_LEFT];
        }
        else if (this._x >= $gameMap.width()) {
            dx = -$gameMap.width();
            dy = $gameMap._map2ConnectY - $gameMap._connectY[C47.POS_RIGHT];
        }
        else if (this._y < 0) {
            dx = $gameMap._map2ConnectX - $gameMap._connectX[C47.POS_UP];
            dy = $gameMap.height2();
        }
        else if (this._y >= $gameMap.height()) {
            dx = $gameMap._map2ConnectX - $gameMap._connectX[C47.POS_DOWN];
            dy = -$gameMap.height();
        }

        newX += dx;
        newY += dy;
        if ($gameTemp.isDestinationValid()) { // 更新点击移动的目标点到地图2
            $gameTemp.setDestination(
                $gameTemp.destinationX() + dx,
                $gameTemp.destinationY() + dy
            );
        }

        // 切换地图时人物正在移动，记录位移
        // _realXY为当前坐标，_xy为要移动到的目标坐标
        dx = this._x - this._realX;
        dy = this._y - this._realY;

        // 交换地图数据
        C47.SeamlessMap.SwitchMaps();

        this.locate2(newX, newY, dx, dy);
        this.refresh();
        this.clearTransferInfo();

        // 重新创建所有地图元素
        SceneManager._scene.removeChildren();
        SceneManager._scene.createDisplayObjects();

        // 调用Scene.start时会处理的函数
        SceneManager._scene._mapNameWindow.open();
        $gameMap.autoplay();

        // 标记正在交换地图
        C47.SeamlessMap._isSwitchingMap = true;
    };

    Game_Player.prototype.locate2 = function(x, y, dx, dy) {
        let followerOffsetX = x - this._realX; // 跟随者在换图时X坐标的偏移量
        let followerOffsetY = y - this._realY; // 跟随者在换图时Y坐标的偏移量
        this._x = Math.round(x);
        this._y = Math.round(y);
        this._realX = x;
        this._realY = y;
        // 必须先更新跟随者才能再改变领队的目标坐标，不然下一个跟随者会移动到领队的目标坐标而不是领队的当前坐标
        this._followers.synchronize2(followerOffsetX, followerOffsetY);
        this._x += dx;
        this._y += dy;
        this.refreshBushDepth();
        this.center(x, y);
        this.makeEncounterCount();
        if (this.isInVehicle()) {
            this.vehicle().refresh();
        }
    };

    //=============================================================================
    // Game_Followers 新增
    //=============================================================================
    Game_Followers.prototype.synchronize2 = function(offsetX, offsetY) {
        this.forEach(function(follower) {
            follower.locate(follower._realX + offsetX, follower._realY + offsetY);
        }, this);

        this.updateMove(); // 跟随领队
    };

    //=============================================================================
    // 新建Game_Event2 继承 Game_Event
    //=============================================================================
    function Game_Event2() {
		Game_Event.apply(this, arguments);
	}
    
    Game_Event2.prototype = Object.create(Game_Event.prototype);
    Game_Event2.prototype.constructor = Game_Event2;

    Game_Event2.prototype.initialize = function(mapId, eventId) {
        Game_Character.prototype.initialize.call(this);
        this._mapId = mapId;
        this._eventId = eventId;
        // 计算地图2中事件的位置，因为地图2偏移了，其内事件也要偏移
        var x = this.event().x;
        var y = this.event().y;
        if ($gameMap._map2Pos == C47.POS_LEFT) {
            x -= $gameMap.width2();
            y += $gameMap._connectY[C47.POS_LEFT] - $gameMap._map2ConnectY;
        }
        else if ($gameMap._map2Pos == C47.POS_DOWN) {
            x -= $gameMap._connectX[C47.POS_DOWN] - $gameMap._map2ConnectX;
            y += $gameMap.height();
        }
        else if ($gameMap._map2Pos == C47.POS_RIGHT) {
            x += $gameMap.width();
            y += $gameMap._connectY[C47.POS_RIGHT] - $gameMap._map2ConnectY;
        }
        else if ($gameMap._map2Pos == C47.POS_UP) {
            x += $gameMap._connectX[C47.POS_UP] - $gameMap._map2ConnectX;
            y -= $gameMap.height2();
        }
        this.locate(x, y);
        this.refresh();
    };

    Game_Event2.prototype.event = function() {
        return $dataMap2.events[this._eventId];
    };

    Game_Event2.prototype.update = function() {
        Game_Character.prototype.update.call(this);
        // 只处理画面，不处理功能
        //this.checkEventTriggerAuto();
        //this.updateParallel();
    };

    //=============================================================================
    // Spriteset_Map 重载
    //=============================================================================
    var _Spriteset_Map_prototype_updateTileset = Spriteset_Map.prototype.updateTileset;
    Spriteset_Map.prototype.updateTileset = function() {
        _Spriteset_Map_prototype_updateTileset.call(this);
        if (C47.SeamlessMap.IsMap2Needed() && this._tilemap2 && this._tileset2 !== $gameMap.tileset2()) {
            this.loadTileset2();
        }
    };

    var _Spriteset_Map_prototype_updateTilemap = Spriteset_Map.prototype.updateTilemap;
    Spriteset_Map.prototype.updateTilemap = function() {
        _Spriteset_Map_prototype_updateTilemap.call(this);
        
        if (C47.SeamlessMap.IsMap2Needed() && !!this._tilemap2) {
            this._tilemap2.origin.x = $gameMap.displayX2() * $gameMap.tileWidth();
            this._tilemap2.origin.y = $gameMap.displayY2() * $gameMap.tileHeight();
        }
    };

    //=============================================================================
    // Spriteset_Map 新增
    //=============================================================================
    Spriteset_Map.prototype.createTilemap2 = function() {
        if (!C47.SeamlessMap.IsMap2Needed() || !$dataMap2) return;

        if (Graphics.isWebGL()) {
            this._tilemap2 = new ShaderTilemap2();
        } else {
            this._tilemap2 = new Tilemap();
        }
        this._tilemap2.tileWidth = $gameMap.tileWidth();
        this._tilemap2.tileHeight = $gameMap.tileHeight();
        this._tilemap2.setData($dataMap2.width, $dataMap2.height, $dataMap2.data);
        this._tilemap2.horizontalWrap = false;
        this._tilemap2.verticalWrap = false;
        this.loadTileset2();

        // 将衔接地图添加到baseSprite
        for (var i = 0; i < this._baseSprite.children.length; i++)
        {
            if (this._baseSprite.children[i] == this._tilemap) {
                this._baseSprite.addChildAt(this._tilemap2, i);
                break;
            }
        }
    };

    Spriteset_Map.prototype.loadTileset2 = function() {
        this._tileset2 = $gameMap.tileset2();
        if (this._tileset2) {
            var tilesetNames = this._tileset2.tilesetNames;
            for (var i = 0; i < tilesetNames.length; i++) {
                this._tilemap2.bitmaps[i] = ImageManager.loadTileset(tilesetNames[i]);
            }
            var newTilesetFlags = $gameMap.tileset2Flags();
            this._tilemap2.refreshTileset();
            if (!this._tilemap2.flags.equals(newTilesetFlags)) {
                this._tilemap2.refresh();
            }
            this._tilemap2.flags = newTilesetFlags;
        }
    };

    Spriteset_Map.prototype.removeMap2 = function() {
        if (!this._tilemap2) return;
        this._baseSprite.removeChild(this._tilemap2);
        this._tilemap2 = null;
    }

    Spriteset_Map.prototype.createCharacters2 = function() {
        let sprites = [];
        $gameMap.events2().forEach(function(event) {
            sprites.push(new Sprite_Character(event));
        }, this);

        for (var i = 0; i < sprites.length; i++) {
            this._tilemap2.addChild(sprites[i]);
        }
    };

    //=============================================================================
    // DataManager 重载
    //=============================================================================
    var _DataManager_onLoad = DataManager.onLoad;
    DataManager.onLoad = function(object) {
        var array;
        if (object === $dataMap2) {
            this.extractMetadata(object);
            array = object.events;

            if (Array.isArray(array)) {
                for (var i = 0; i < array.length; i++) {
                    var data = array[i];
                    if (data && data.note !== undefined) {
                        this.extractMetadata(data);
                    }
                }
            }

            C47.SeamlessMap.ReadNote2();
            $gameMap.setTileset2Id(object.tilesetId);
            C47.SeamlessMap._loadedTileset2Id = object.tilesetId;
            SceneManager.createMap2();
        }
        else {
            _DataManager_onLoad.call(this, object);
        }
    };

    //=============================================================================
    // DataManager 新增
    //=============================================================================
    DataManager.loadMap2Data = function(mapId) {
        if (mapId > 0) {
            $gameMap._map2Id = mapId;
            var filename = 'Map%1.json'.format(mapId.padZero(3));
            if (C47.SeamlessMap._loadedMapFile == filename) { // 开关菜单等需要重载当前地图时，不再重复读取数据
                C47.SeamlessMap.ReadNote2();
                if ($gameMap.tileset2Id() == 0) $gameMap.setTileset2Id(C47.SeamlessMap._loadedTileset2Id); 
                SceneManager.createMap2();
                return;
            }
            this._mapLoader = ResourceHandler.createLoader('data/' + filename, this.loadDataFile.bind(this, '$dataMap2', filename));
            this.loadDataFile('$dataMap2', filename);
            C47.SeamlessMap._loadedMapFile = filename; // 记录读取的文件名，防止重复读取
        } else {
            this.makeEmptyMap2();
        }
    };

    DataManager.makeEmptyMap2 = function() {
        $dataMap2 = {};
        $dataMap2.data = [];
        $dataMap2.events = [];
        $dataMap2.width = 100;
        $dataMap2.height = 100;
        $dataMap2.scrollType = 3;
    };

    //=============================================================================
    // SceneManager 重载
    //=============================================================================
    var _SceneManager_requestUpdate = SceneManager.requestUpdate;
    SceneManager.requestUpdate = function() {
        if (!C47.SeamlessMap.HasRequiredBindData()
            || (!C47.SeamlessMap.IsRequiredBindDataReadyToLoad(C47.SeamlessMap._RequiredBindData1)
                && !C47.SeamlessMap.IsRequiredBindDataReadyToLoad(C47.SeamlessMap._RequiredBindData2))) {
            _SceneManager_requestUpdate.call(this);
        }
        else { // 有相邻地图纹理需要加载，放到下一帧处理，以防当前帧渲染卡顿
            C47.SeamlessMap._SceneManager = this;
            requestAnimationFrame(C47.SeamlessMap.DoBindTexture);
        }
    };

    SceneManager.renderScene = function() {
        if (this.isCurrentSceneStarted()) {
            Graphics.render(this._scene);
            if (C47.SeamlessMap._isSwitchingMap) C47.SeamlessMap._isSwitchingMap = false;
            if (C47.SeamlessMap._isFirstFrameAfterLoadData) { // 刚加载地图纹理后第一次渲染会黑屏一下，因此渲染两次
                Graphics._skipCount = 0; // 需要连续渲染时不能跳过
                Graphics.render(this._scene);
                C47.SeamlessMap._isFirstFrameAfterLoadData = false;
            }
        } else if (this._scene) {
            this.onSceneLoading();
        }
    };

    //=============================================================================
    // SceneManager 新增
    //=============================================================================
    SceneManager.createMap2 = function() {
        if (!this._scene._spriteset) return;

        this._scene._spriteset.removeMap2();
        this._scene._spriteset.createTilemap2();
        $gameMap.setupEvents2();
        this._scene._spriteset.createCharacters2();
    }

    var _Scene_Map_prototype_createSpriteset = Scene_Map.prototype.createSpriteset;
    Scene_Map.prototype.createSpriteset = function() {
        _Scene_Map_prototype_createSpriteset.call(this);
        let map2Dir = $gameMap.checkMap2Dir();
        if (map2Dir != C47.POS_NONE) {
            if ($gameMap._conenctMapIds[map2Dir] > 0) {
                $gameMap._map2Pos = map2Dir;
                DataManager.loadMap2Data($gameMap._conenctMapIds[map2Dir]);
            }
        }
    };

    //=============================================================================
    // 新建ShaderTilemap2 继承 ShaderTilemap
    //=============================================================================
	function ShaderTilemap2() {
		ShaderTilemap.apply(this, arguments);
		this.roundPixels = true;
	}
	
	PIXI.tilemap2.TileRenderer.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    PIXI.tilemap2.TileRenderer.DO_CLEAR = p_DoClear;
    PIXI.tilemap.TileRenderer.DO_CLEAR = p_DoClear;

	ShaderTilemap2.prototype = Object.create(ShaderTilemap.prototype);
	ShaderTilemap2.prototype.constructor = ShaderTilemap2;
	
	ShaderTilemap2.prototype._createLayers = function() {
		var width = this._width;
		var height = this._height;
		var margin = this._margin;
		var tileCols = Math.ceil(width / this._tileWidth) + 1;
		var tileRows = Math.ceil(height / this._tileHeight) + 1;
		var layerWidth = this._layerWidth = tileCols * this._tileWidth;
		var layerHeight = this._layerHeight = tileRows * this._tileHeight;
		this._needsRepaint = true;

		if (!this.lowerZLayer) {
			//@hackerham: create layers only in initialization. Doesn't depend on width/height
			this.addChild(this.lowerZLayer = new PIXI.tilemap2.ZLayer(this, 0));
			this.addChild(this.upperZLayer = new PIXI.tilemap2.ZLayer(this, 4));

			var parameters = PluginManager.parameters('ShaderTilemap');
			var useSquareShader = Number(parameters.hasOwnProperty('squareShader') ? parameters['squareShader'] : 0);

			this.lowerZLayer.addChild(this.lowerLayer = new PIXI.tilemap2.CompositeRectTileLayer(0, [], useSquareShader));
			this.lowerLayer.shadowColor = new Float32Array([0.0, 0.0, 0.0, 0.5]);
			this.upperZLayer.addChild(this.upperLayer = new PIXI.tilemap2.CompositeRectTileLayer(4, [], useSquareShader));
		}
    };
    
    //=============================================================================
    // pixi-tilemap.js 内部修改
    //=============================================================================
    // 检查是否已载入纹理
    PIXI.tilemap.TileRenderer.prototype.bindTexturesCheck = function (renderer, textures) {
        if (C47.SeamlessMap._RequiredBindData1) return;
        var bounds = this.boundSprites;
        var len = textures.length;
        var maxTextures = this.maxTextures;
        if (len > 4 * maxTextures) {
            return;
        }
        var isBindRequired = false;
        for (var i = 0; i < len; i++) {
            var texture = textures[i];
            if (!texture || !textures[i].valid)
                continue;
            var bs = bounds[i >> 2][i & 3];
            if (!bs.texture || bs.texture.baseTexture !== texture.baseTexture) {
                isBindRequired = true;
                break;
            }
        }
        
        if (isBindRequired) {
            C47.SeamlessMap._RequiredBindData1 = {
                tile: this,
                renderer: renderer,
                textures: textures
            };
        }
    };

    // 原先的载入纹理步骤，大部分转移至C47.SeamlessMap.BindTextures
    PIXI.tilemap.TileRenderer.prototype.bindTextures = function (renderer, shader, textures) {
        var glts = this.glTextures;
        var maxTextures = this.maxTextures;
        this.texLoc.length = 0;
        for (var i = 0; i < maxTextures; i++) {
            this.texLoc.push(renderer.bindTexture(glts[i], i, true));
        }
        shader.uniforms.uSamplers = this.texLoc;
    };

    var _PIXI_tilemap_RectTileLayer_prototype_renderWebGL = PIXI.tilemap.RectTileLayer.prototype.renderWebGL;
    PIXI.tilemap.RectTileLayer.prototype.renderWebGL = function  (renderer, useSquare) {
        var tile = renderer.plugins.tilemap;
        tile.bindTexturesCheck(renderer, this.textures);

        if (!C47.SeamlessMap._RequiredBindData1) {
            _PIXI_tilemap_RectTileLayer_prototype_renderWebGL.apply(this, arguments);
        }
        else if (C47.SeamlessMap._isSwitchingMap) {
            C47.SeamlessMap.DoBindTexture();
            _PIXI_tilemap_RectTileLayer_prototype_renderWebGL.apply(this, arguments);
        }
    }

    //=============================================================================
    // pixi-tilemap2.js 内部修改
    //=============================================================================
    // 检查是否已载入纹理
    PIXI.tilemap2.TileRenderer.prototype.bindTexturesCheck = function (renderer, textures) {
        if (C47.SeamlessMap._RequiredBindData2) return;
        var bounds = this.boundSprites;
        var len = textures.length;
        var maxTextures = this.maxTextures;
        if (len > 4 * maxTextures) {
            return;
        }
        var isBindRequired = false;
        for (var i = 0; i < len; i++) {
            var texture = textures[i];
            if (!texture || !textures[i].valid)
                continue;
            var bs = bounds[i >> 2][i & 3];
            if (!bs.texture || bs.texture.baseTexture !== texture.baseTexture) {
                isBindRequired = true;
                break;
            }
        }
        
        if (isBindRequired) {
            C47.SeamlessMap._RequiredBindData2 = {
                tile: this,
                renderer: renderer,
                textures: textures
            };
        }
    };

    // 原先的载入纹理步骤，大部分转移至C47.SeamlessMap.BindTextures
    PIXI.tilemap2.TileRenderer.prototype.bindTextures = function (renderer, shader, textures) {
        var glts = this.glTextures;
        var maxTextures = this.maxTextures;
        this.texLoc.length = 0;
        for (var i = 0; i < maxTextures; i++) {
            this.texLoc.push(renderer.bindTexture(glts[i], i, true));
        }
        shader.uniforms.uSamplers = this.texLoc;
    };

    var _PIXI_tilemap2_RectTileLayer_prototype_renderWebGL = PIXI.tilemap2.RectTileLayer.prototype.renderWebGL;
    PIXI.tilemap2.RectTileLayer.prototype.renderWebGL = function  (renderer, useSquare) {
        var tile = renderer.plugins.tilemap2;
        tile.bindTexturesCheck(renderer, this.textures);
        
        if (!C47.SeamlessMap._RequiredBindData2) {
            _PIXI_tilemap2_RectTileLayer_prototype_renderWebGL.apply(this, arguments);
        }
        else if (C47.SeamlessMap._isSwitchingMap) {
            C47.SeamlessMap.DoBindTexture();
            _PIXI_tilemap2_RectTileLayer_prototype_renderWebGL.apply(this, arguments);
        }
    }
})();