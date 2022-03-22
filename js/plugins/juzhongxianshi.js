//对话框文字居中
//------------------------------------------------------------------------
 
Window_Base.prototype.processCharacter = function(textState) {
 
    switch (textState.text[textState.index]) {
    case '\n':
            this.processNormalCharacter_er(textState)
        this.processNewLine(textState);
        break;
    case '\f':
        this.processNewPage(textState);
        break;
    case '\x1b':
        this.processEscapeCharacter(this.obtainEscapeCode(textState), textState);
        break;
    default:
        this.processNormalCharacter(textState);
        break;
    }
};
 
Window_Base.prototype.processNormalCharacter_er = function(textState) {
        var width = 0
        for (var i=0;i<this._zancun_wenzi.length;i++) {
                var c = this._zancun_wenzi[i];
        var w = this.textWidth(c);
                width += w
        }
 
        for (var i=0;i<this._zancun_wenzi.length;i++) {
                var c = this._zancun_wenzi[i];
        var w = this.textWidth(c);
                var x = (this.width - 36 - width) / 2 + (w * i)
                this.contents.drawText(c, x, textState.y, w * 2, textState.height);
        }
        this._zancun_wenzi = []
 
}
 
Window_Message.prototype.isEndOfText = function(textState) {
        var kai = textState.index >= textState.text.length;
        if (kai) {
                this.processNormalCharacter_er(textState)
        }
    return kai
};
 
Window_Base.prototype.processNormalCharacter = function(textState) {
    var c = textState.text[textState.index++];
    var w = this.textWidth(c);
        this._zancun_wenzi = this._zancun_wenzi || []
        this._zancun_wenzi.push(c)
        return
};