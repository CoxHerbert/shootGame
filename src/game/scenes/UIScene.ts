import Phaser from 'phaser';
import { QuestManager } from '@/services/QuestManager';

export default class UIScene extends Phaser.Scene {
  private quests!: QuestManager;
  private btn!: Phaser.GameObjects.Image;
  private badge!: Phaser.GameObjects.Image;
  private badgeText!: Phaser.GameObjects.Text;
  private panel?: Phaser.GameObjects.Container;

  constructor() { super({ key: 'UIScene' }); }

  init(data: { quests: QuestManager }) { this.quests = data.quests; }

  preload() {
    this.load.svg('ui_task_btn', '/assets/svg/task_button.svg');
    this.load.svg('ui_badge', '/assets/svg/red_dot.svg');
    this.load.svg('coin', '/assets/svg/coin.svg');
  }

  create() {
    const { width } = this.scale;
    this.btn = this.add.image(width - 100, 50, 'ui_task_btn').setInteractive({ useHandCursor: true }).setDepth(1000);
    this.btn.on('pointerup', () => this.togglePanel());

    this.badge = this.add.image(this.btn.x + 24, this.btn.y - 22, 'ui_badge').setDepth(1001);
    this.badgeText = this.add.text(this.badge.x, this.badge.y, '0', { fontSize: '14px', color: '#fff' }).setOrigin(0.5).setDepth(1002);
    const refresh = () => {
      const n = this.quests.badgeCount();
      this.badge.setVisible(n > 0);
      this.badgeText.setVisible(n > 0);
      this.badgeText.setText(String(n));
    };
    this.quests.on('changed', refresh);
    refresh();

    this.createPanel();
  }

  private createPanel() {
    const { width } = this.scale;
    const panelW = 380;
    const panelH = 300;
    const bg = this.add.rectangle(0,0,panelW,panelH,0x000000,0.7).setOrigin(0);
    const title = this.add.text(16,12,'任务',{ fontSize:'20px', color:'#fff' });
    this.panel = this.add.container(width - panelW - 20,80,[bg,title]).setDepth(999).setVisible(false);

    const render = (type:'daily'|'weekly', startY:number) => {
      const header=this.add.text(16,startY,type==='daily'?'每日任务':'每周任务',{fontSize:'16px',color:'#9feaf9'});
      this.panel!.add(header);
      let y=startY+28;
      for(const t of this.quests.getTasks(type)){
        const text=this.add.text(16,y,`${t.title}  ${t.progress??0}/${t.progressRequired}`,{fontSize:'14px',color:'#fff'});
        const btn=this.add.text(panelW-86,y,this.quests.canClaim(t.id)?'领取':'进行中',{fontSize:'14px',color:this.quests.canClaim(t.id)?'#00ff99':'#aaa'}).setInteractive({useHandCursor:true});
        btn.on('pointerup',()=>{
          if(this.quests.claim(t.id)){
            text.setText(`${t.title}  ${t.progress??0}/${t.progressRequired}`);
            btn.setText('已领取').setColor('#aaa');
            this.playReward(btn.x,btn.y);
          }
        });
        this.panel!.add([text,btn]);
        y+=28;
      }
    };
    render('daily',44);
    render('weekly',44+28*(this.quests.getTasks('daily').length+1));
  }

  private togglePanel(){ if(this.panel) this.panel.visible=!this.panel.visible; }

  private playReward(x:number,y:number){
    for(let i=0;i<10;i++){
      const c=this.add.image(x,y,'coin').setDepth(1200).setScale(0.6);
      this.tweens.add({
        targets:c,
        x:this.btn.x+Phaser.Math.Between(-20,20),
        y:this.btn.y+Phaser.Math.Between(-10,10),
        alpha:0.2,
        angle:Phaser.Math.Between(-180,180),
        duration:Phaser.Math.Between(500,800),
        ease:'Cubic.easeIn',
        onComplete:()=>c.destroy()
      });
    }
  }
}
