//=============================================================================
// Akena_Message_Custom.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc [v1.0] 이미지 한 장으로 본창·이름창·선택지 꾸미기 <Akena_Message_Custom>
 * @author Akena
 * @help
 * Akena_Message_Custom - 이미지 대화창
 * [설치]
 * JS를 js/plugins에 넣고 플러그인 관리자에서 켜세요.
 * 직접 준비한 PNG를 img/pictures 또는 그 하위 폴더에 넣으세요.
 * 관리자에서 '프레임 이미지'를 선택하세요. 초기값은 비어 있으며 기본 MZ 창을 표시합니다.
 * 이 플러그인은 JS만 제공하며 이미지 파일은 포함하지 않습니다. 별도 이벤트 명령은 없습니다.
 *
 * [적용]
 * 기본 텍스트 표시·화자 이름·선택지 표시를 그대로 사용하세요.
 * 본창·이름창·선택지에 같은 이미지 한 장을 9분할해 적용합니다.
 * 창 너비는 화면에 맞추고 높이는 본문4줄 공간을 확보합니다.
 * 이름창·선택지는 문구·항목 수에 따라 크기를 정합니다.
 * 글자 여백·줄바꿈·페이지·선택지 입력 좌표는 내부에서 처리합니다.
 * 숫자/아이템 입력창과 메뉴는 변경하지 않습니다.
 * 이미지 미지정/누락은 기본 창, 어둡게/투명은 이벤트 설정을 유지합니다.
 *
 * [이미지 제작]
 * 본인 게임의 대화창에 맞는 간결한 테두리 PNG를 준비하세요.
 * 영상의 시연용 이미지1280×220은 필수 규격이 아닙니다. 원본과 표시 크기는 달라도 됩니다.
 * 바깥32px는 테두리, 중앙은 글자를 넣을 배경으로 만드세요.
 * 네 모서리32px를 보존하고 변/중앙을 늘립니다. 원본은 가로·세로65px 이상.
 * 중앙까지 침범하는 그림·큰 장식·이미지 안의 문자는 피하세요.
 * 임의 그림의 글자 안전 영역을 자동 인식하는 기능은 아닙니다.
 * 완성 게임을 배포할 때는 선택한 PNG와 하위 폴더 구조도 함께 포함하세요.
 *
 * [호환성]
 * 메시지3개 클래스의 내부 크기·배치·출력·클리핑과 선택지 입력을 별칭 호출합니다.
 * 같은 창을 바꾸는 다른 플러그인은 조합 검수가 필요합니다.
 * 우→좌 본문은 수동 줄바꿈을 사용합니다. 큰 글꼴·작은 화면은 별도 확인하세요.
 *
 * @param Image
 * @text 프레임 이미지
 * @type file
 * @dir img/pictures
 * @default
 * @desc 직접 준비한 본창·화자 이름·선택지 공통 PNG를 선택하세요. 빈 값은 MZ 기본 창.
 */
(() => {
    "use strict";
    const pluginName = "Akena_Message_Custom";
    window.Akena = window.Akena || {};
    const api = window.Akena.Message_Custom = {};
    const params = PluginManager.parameters(pluginName);
    // 제작 규격에 맞는 프레임은 이미지 선택만으로 적용한다.
    const cfg = api.config = Object.freeze({
        image: params.Image ?? "",
        get width() { return Math.max(1,Math.floor(Graphics.boxWidth*15/16)); },
        height: 220, y: -20, left: 40, right: 40, top: 32, bottom: 32, border: 32
    });
    // 전역 이미지 캐시에 오류를 넣지 않아 누락 PNG가 게임을 중단시키지 않는다.
    const bitmap = cfg.image ? Bitmap.load("img/pictures/" + Utils.encodeURI(cfg.image) + ".png") : null;
    const type = win => win instanceof Window_ChoiceList ? $gameMessage.choiceBackground() : $gameMessage.background();
    const active = win => !!bitmap && !bitmap.isError() && type(win) === 0;
    const clamp = (value, min, max) => Math.max(min, Math.min(value, Math.max(min,max)));
    function margins(win) {
        if (!active(win)) return {left:win.padding,right:win.padding,top:win.padding,bottom:win.padding};
        // 좁거나 낮은 창에서도 내용 Bitmap의 크기를 음수로 만들지 않는다.
        const sx = Math.min(1, Math.max(0,win.width-1) / Math.max(1,cfg.left+cfg.right));
        const body = win instanceof Window_Message ? Math.min(win.height, win.lineHeight()*4) : 1;
        const sy = Math.min(1, Math.max(0,win.height-body) / Math.max(1,cfg.top+cfg.bottom));
        return {left:Math.floor(cfg.left*sx),right:Math.floor(cfg.right*sx),top:Math.floor(cfg.top*sy),bottom:Math.floor(cfg.bottom*sy)};
    }
    // 글자·커서·클리핑을 같은 내부 영역에 맞춘다. 입력 판정도 같은 원점을 쓴다.
    for (const Class of [Window_Message,Window_NameBox,Window_ChoiceList]) {
        for (const [prop,a,b,axis] of [["innerWidth","left","right","width"],["innerHeight","top","bottom","height"]]) {
            const original = Object.getOwnPropertyDescriptor(Window.prototype,prop).get;
            Object.defineProperty(Class.prototype,prop,{configurable:true,get() {
                const value = original.call(this), m = margins(this);
                return active(this) ? Math.max(1,this[axis]-m[a]-m[b]) : value;
            }});
        }
        const client = Class.prototype._updateClientArea;
        Class.prototype._updateClientArea = function() {
            client.call(this);
            if (active(this)) { const m=margins(this); this._clientArea.move(m.left-this.origin.x,m.top-this.origin.y); }
        };
        const update = Class.prototype.update;
        Class.prototype.update = function() { update.call(this); updateImage(this); };
    }
    const placement = Window_Message.prototype.updatePlacement;
    Window_Message.prototype.updatePlacement = function() {
        const custom = active(this), width = custom ? Math.min(cfg.width,Graphics.boxWidth) : Graphics.boxWidth;
        const height = custom ? Math.min(Math.max(cfg.height,cfg.top+cfg.bottom+this.lineHeight()*4),Graphics.boxHeight) : Scene_Base.prototype.calcWindowHeight.call(this,4,false)+8;
        this.move(Math.floor((Graphics.boxWidth-width)/2),this.y,width,height);
        placement.call(this);
        if (custom) {
            this.y=clamp(this.y+cfg.y,0,Graphics.boxHeight-this.height);
        }
    };
    const startMessage = Window_Message.prototype.startMessage;
    Window_Message.prototype.startMessage = function() {
        this.updatePlacement(); this.createContents();
        startMessage.call(this);
    };
    const loading = Window_Message.prototype.updateLoading;
    Window_Message.prototype.updateLoading = function() {
        const original = loading.call(this);
        // active가 이미지 존재 여부와 오류 상태를 이미 확인한다.
        return original || ($gameMessage.isBusy() && active(this) && !bitmap.isReady());
    };
    function faceSize(win) { return Math.max(1,Math.min(144,win.innerHeight,win.innerWidth-8)); }
    const lineX = Window_Message.prototype.newLineX;
    Window_Message.prototype.newLineX = function(state) {
        const original=lineX.call(this,state);
        if (!active(this) || !$gameMessage.faceName()) return original;
        return state.rtl ? this.innerWidth-faceSize(this)-20 : faceSize(this)+20;
    };
    const face = Window_Message.prototype.drawFace;
    Window_Message.prototype.drawFace = function(name,index,x,y,width,height) {
        if (!active(this) || faceSize(this)>=144) return face.call(this,name,index,x,y,width,height);
        const size=faceSize(this),ctx=this.contents.context;
        ctx.save(); ctx.translate($gameMessage.isRTL()?this.innerWidth-size-4:4,0);ctx.scale(size/144,size/144);
        try { face.call(this,name,index,0,0,144,144); } finally { ctx.restore(); }
    };
    // 페이지 대기 중에는 현재 문자를 소비하지 않고 원본 페이지 처리로 넘긴다.
    const character = Window_Message.prototype.processCharacter;
    Window_Message.prototype.processCharacter = function(state) {
        if (active(this) && state===this._textState && state.drawing && !state.rtl) {
            const code=state.text.codePointAt(state.index), ch=String.fromCodePoint(code||0);
            const icon=/^\x1bI\[\d+\]/i.test(state.text.slice(state.index));
            const printable=code>=0x20 && !(code>=0xdc00&&code<=0xdfff);
            if (printable || icon) {
                const pending=this.textWidth(state.buffer||"")+(icon?ImageManager.iconWidth+4:this.textWidth(ch));
                if (state.x+pending>this.contents.width-4 && (state.x>state.startX || state.buffer.length)) {
                    this.flushTextState(state); this.processNewLine(state);
                    if (this.pause) return;
                }
            }
        }
        character.call(this,state);
    };
    // 보조창 크기는 공통 여백을 포함해 계산하며, 긴 단일 문구는 가로 축소한다.
    for (const Class of [Window_NameBox,Window_ChoiceList]) {
        const ww=Class.prototype.windowWidth, wh=Class.prototype.windowHeight, draw=Class.prototype.drawTextEx;
        Class.prototype.windowWidth=function() {
            const original=ww.call(this);
            if (!active(this) || !original) return original;
            const natural=this instanceof Window_NameBox ? Math.ceil(this.textSizeEx(this._name).width)+this.itemPadding()*2 : this.maxChoiceWidth()+this.colSpacing();
            return Math.min(Graphics.boxWidth,natural+cfg.left+cfg.right);
        };
        Class.prototype.windowHeight=function() {
            const original=wh.call(this);
            return active(this) ? original-$gameSystem.windowPadding()*2+cfg.top+cfg.bottom : original;
        };
        Class.prototype.drawTextEx=function(text,x,y,width) {
            const natural=active(this)?this.textSizeEx(text).width:0;
            const scale=natural>width&&width>0?width/natural:1,ctx=this.contents.context;
            if (scale===1) return draw.call(this,text,x,y,width);
            ctx.save();ctx.translate(x,0);ctx.scale(scale,1);ctx.translate(-x,0);
            try { return draw.call(this,text,x,y,width)*scale; } finally { ctx.restore(); }
        };
    }
    const maxLines=Window_ChoiceList.prototype.maxLines;
    Window_ChoiceList.prototype.maxLines=function() {
        const original=maxLines.call(this);
        if (!active(this)||!this._messageWindow) return original;
        const w=this._messageWindow, above=w.y, below=Graphics.boxHeight-w.y-w.height;
        const name=$gameMessage.speakerName()?36+cfg.top+cfg.bottom+8:0;
        return Math.max(1,Math.min(original,Math.floor((Math.max(above,below)-cfg.top-cfg.bottom-name)/this.itemHeight())));
    };
    const choicePlacement=Window_ChoiceList.prototype.updatePlacement;
    Window_ChoiceList.prototype.updatePlacement=function() {
        choicePlacement.call(this);
        if (!active(this)) return;
        this.x=clamp(this.x,0,Graphics.boxWidth-this.width);this.y=clamp(this.y,0,Graphics.boxHeight-this.height);
        const n=this._messageWindow?._nameBoxWindow;
        if(n?._name && this.x<n.x+n.width && this.x+this.width>n.x && this.y<n.y+n.height && this.y+this.height>n.y) {
            const above=n.y-this.height-8,below=n.y+n.height+8;
            if(above>=0) this.y=above;
            else if(below+this.height<=Graphics.boxHeight) this.y=below;
        }
    };
    const hit=Window_ChoiceList.prototype.hitTest;
    Window_ChoiceList.prototype.hitTest=function(x,y) {
        const m=margins(this);
        return hit.call(this,x-(m.left-this.padding),y-(m.top-this.padding));
    };
    const inside=Window_ChoiceList.prototype.isTouchedInsideFrame;
    Window_ChoiceList.prototype.isTouchedInsideFrame=function() {
        const original=inside.call(this);if(!active(this))return original;
        const p=this.worldTransform.applyInverse(new Point(TouchInput.x,TouchInput.y)),m=margins(this);
        return new Rectangle(m.left,m.top,this.innerWidth,this.innerHeight).contains(p.x,p.y);
    };
    // PNG 한 장의 모서리4개는 유지하고 가장자리4개·중앙을 늘린다.
    function updateImage(win) {
        let view=win._akenaCustomBackground;
        if(!view) {
            const container=new Sprite(),parts=Array.from({length:9},()=>new Sprite(bitmap));
            parts.forEach(p=>container.addChild(p));win._container.addChildAt(container,0);
            view=win._akenaCustomBackground={container,parts,key:"",hidden:false};
        }
        const show=active(win)&&bitmap.isReady()&&win.width>0&&win.height>0;
        view.container.visible=show;
        if(show) {
            // 코어가 렌더 직전 visible을 갱신하므로 renderable로 기본 외곽을 숨긴다.
            if(!view.hidden) {view.back=win._backSprite.renderable;view.frame=win._frameSprite.renderable;view.hidden=true;}
            win._backSprite.renderable=false;win._frameSprite.renderable=false;
            const key=[win.width,win.height,bitmap.width,bitmap.height].join(',');
            if(key!==view.key) {
                const b=Math.min(cfg.border,Math.floor((bitmap.width-1)/2),Math.floor((bitmap.height-1)/2));
                const dx=Math.min(b,win.width/2),dy=Math.min(b,win.height/2);
                const sx=[0,b,bitmap.width-b,bitmap.width],sy=[0,b,bitmap.height-b,bitmap.height];
                const xx=[0,dx,win.width-dx,win.width],yy=[0,dy,win.height-dy,win.height];
                for(let y=0;y<3;y++)for(let x=0;x<3;x++) {
                    const part=view.parts[y*3+x],sw=sx[x+1]-sx[x],sh=sy[y+1]-sy[y];
                    part.setFrame(sx[x],sy[y],sw,sh);part.move(xx[x],yy[y]);
                    part.scale.set((xx[x+1]-xx[x])/sw,(yy[y+1]-yy[y])/sh);
                }
                view.key=key;
            }
        }else if(view.hidden) {win._backSprite.renderable=view.back;win._frameSprite.renderable=view.frame;view.hidden=false;}
    }
})();
