import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-aviso',
  standalone: true,
  template: `
    @if (erro) { <div class="aviso aviso-erro">{{ erro }}</div> }
    @if (ok) { <div class="aviso aviso-ok">{{ ok }}</div> }
  `,
})
export class AvisoComponent {
  @Input() erro = '';
  @Input() ok = '';
}
