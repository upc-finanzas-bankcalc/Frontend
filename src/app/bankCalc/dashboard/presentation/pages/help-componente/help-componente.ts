import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-help-componente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './help-componente.html',
  styleUrls: ['./help-componente.scss']
})
export class HelpComponente {
  activeFaq: number | null = null;

  toggleFaq(faqId: number) {
    if (this.activeFaq === faqId) {
      this.activeFaq = null;
    } else {
      this.activeFaq = faqId;
    }
  }
}
