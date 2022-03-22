//=============================================================================
// biaotishezhiquchu.js
//=============================================================================

/*:
 * @plugindesc 去除标题选项
 * @author yundream
 *
 * @help
 * 可商用|简单代码无技术可言
 * 开启即可使用:
 * 没了设置可能也许会好看！
 *<－biubiu－⊂(`ω´∩)
 */

Window_TitleCommand.prototype.makeCommandList = function() {
    this.addCommand(TextManager.newGame,   'newGame');
    this.addCommand(TextManager.continue_, 'continue', this.isContinueEnabled());
};