import { Injectable } from '@angular/core';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor() { }

  success(message: string): void {
    Toastify({
      text: message,
      duration: 3000,
      gravity: "top", // `top` or `bottom`
      position: "right", // `left`, `center` or `right`
      stopOnFocus: true, // Prevents dismissing of toast on hover
      style: {
        background: "#00b09b",
      }
    }).showToast();
  }

  error(message: string): void {
    Toastify({
      text: message,
      duration: 3000,
      gravity: "top",
      position: "right",
      stopOnFocus: true,
      style: {
        background: "#ff5f6d",
      }
    }).showToast();
  }

  warning(message: string): void {
    Toastify({
      text: message,
      duration: 3000,
      gravity: "top",
      position: "right",
      stopOnFocus: true,
      style: {
        background: "#f093fb",
      }
    }).showToast();
  }

  info(message: string): void {
    Toastify({
      text: message,
      duration: 3000,
      gravity: "top",
      position: "right",
      stopOnFocus: true,
      style: {
        background: "#4facfe",
      }
    }).showToast();
  }

  // Método temporal para mantener compatibilidad mientras se implementa una solución mejor
  show(message: string): void {
    this.info(message);
  }
}
