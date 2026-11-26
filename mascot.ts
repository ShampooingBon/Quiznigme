import gsap from 'gsap';

export const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
const IMG = `${import.meta.env.BASE_URL}cat.png`;
const REST = 0.4;   // bouche presque fermée au repos
const LID = 118;    // hauteur de déplacement des paupières

/** Le chat est l'image fournie, JAMAIS redessinée : les paupières et la mâchoire sont des
 *  calques qui réutilisent les pixels de l'image (clip + étirement) pour animer. */
export class Mascot {
  private jaw: SVGElement; private lids: SVGElement[];
  private run = 0; private skipping = false;

  constructor(root: HTMLElement) {
    root.innerHTML = `<div class="catbox"><img src="${IMG}" alt="Mascotte de Quiznigme" draggable="false"/>
<svg viewBox="0 0 750 820" aria-hidden="true"><defs>
<clipPath id="cm"><ellipse cx="305" cy="412" rx="56" ry="34"/></clipPath>
<clipPath id="cl"><ellipse cx="205" cy="272" rx="54" ry="49"/></clipPath>
<clipPath id="cr"><ellipse cx="405" cy="272" rx="54" ry="49"/></clipPath></defs>
<g clip-path="url(#cm)"><rect x="240" y="370" width="130" height="100" fill="#faf9f2"/><image class="jaw" href="${IMG}" width="750" height="820"/></g>
<g clip-path="url(#cl)"><g class="lid"><rect x="140" y="215" width="130" height="112" fill="#f5dba8"/><rect x="140" y="321" width="130" height="7" fill="#4a2a15"/></g></g>
<g clip-path="url(#cr)"><g class="lid"><rect x="340" y="215" width="130" height="112" fill="#f5dba8"/><rect x="340" y="321" width="130" height="7" fill="#4a2a15"/></g></g></svg></div>`;
    this.jaw = root.querySelector('.jaw')!;
    this.lids = [...root.querySelectorAll<SVGElement>('.lid')];
    gsap.set(this.lids, { y: -LID });
    gsap.set(this.jaw, { scaleY: REST, svgOrigin: '305 388' });
    gsap.to(root.firstElementChild, { y: -5, rotation: 0.8, duration: 2.2, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    this.blink();
  }

  private blink() {
    gsap.delayedCall(1.8 + Math.random() * 3.2, () => {
      const tl = gsap.timeline({ onComplete: () => this.blink() });
      tl.to(this.lids, { y: 0, duration: 0.07 }).to(this.lids, { y: -LID, duration: 0.12 });
      if (Math.random() < 0.25) tl.to(this.lids, { y: 0, duration: 0.07, delay: 0.08 }).to(this.lids, { y: -LID, duration: 0.12 });
    });
  }

  skip() { this.skipping = true; }

  /** Écrit le texte lettre par lettre pendant que les lèvres bougent. */
  async say(el: HTMLElement, text: string, speed = 38) {
    const id = ++this.run; this.skipping = false; el.textContent = '';
    for (let i = 0; i < text.length; i++) {
      if (id !== this.run) return;
      if (this.skipping) { el.textContent = text; break; }
      const ch = text[i]; el.textContent += ch;
      const open = /[\p{L}\p{N}]/u.test(ch) ? 0.55 + Math.random() * 0.6 : REST;
      gsap.to(this.jaw, { scaleY: open, duration: 0.06, overwrite: true });
      await wait(/[.,!?:]/.test(ch) ? speed * 4 : speed);
    }
    gsap.to(this.jaw, { scaleY: REST, duration: 0.2, overwrite: true });
  }
}
