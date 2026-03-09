import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { FooterComponent } from '../../../shared/footer/footer.component';
import Swal from 'sweetalert2';

import { ReservationService } from '../../../core/services/reservation.service';
import { Reservation } from '../../../models/reservation.model';

type DinningTableSummary = { id: string; nombre: string; capacidad: number };

@Component({
  selector: 'app-recep-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DatePipe, NavbarComponent, FooterComponent],
  templateUrl: './reservations.component.html',
  styleUrl: './reservations.component.css',
})
export class Reservations implements OnInit {
  // Filters
  filtroFecha = '';
  filtroHora = '';
  filtroEstado = '';
  filtroCliente = '';

  allReservations: Reservation[] = [];
  reservations: Reservation[] = [];
  allTables: DinningTableSummary[] = [];

  isLoading = false;
  errorMessage = '';

  constructor(
    private reservationService: ReservationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadReservations();
    this.reservationService.getTablesForReservations().subscribe({
      next: (tables) => { this.allTables = tables; },
      error: (err) => console.error('Error cargando mesas:', err)
    });
  }

  loadReservations() {
    this.isLoading = true;
    this.reservationService.getAllReservations().subscribe({
      next: (data) => {
        this.allReservations = data;
        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Error al cargar las reservas.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters() {
    this.reservations = this.allReservations.filter(r => {
      const fechaFull = r.fechaReserva ? r.fechaReserva.split('T')[0] : '';
      const horaFull = r.fechaReserva ? r.fechaReserva.split('T')[1]?.substring(0, 5) : '';
      const matchFecha = !this.filtroFecha || fechaFull === this.filtroFecha;
      const matchHora = !this.filtroHora || horaFull?.startsWith(this.filtroHora);
      const matchEstado = !this.filtroEstado || r.estado.toLowerCase() === this.filtroEstado.toLowerCase();
      const searchTerm = this.filtroCliente.toLowerCase();
      const matchCliente = !searchTerm
        || r.clienteEmail.toLowerCase().includes(searchTerm)
        || (r.clienteNombre ?? '').toLowerCase().includes(searchTerm);
      return matchFecha && matchHora && matchEstado && matchCliente;
    });
  }

  clearFilters() {
    this.filtroFecha = '';
    this.filtroHora = '';
    this.filtroEstado = '';
    this.filtroCliente = '';
    this.applyFilters();
  }

  async confirmarReserva(r: Reservation) {
    if (r.estado !== 'SOLICITADA') return;

    const tablesHtml = this.allTables.map(t =>
      `<label style="display:flex;gap:8px;align-items:center;margin:6px 0;cursor:pointer;">
        <input type="checkbox" id="mesa-${t.id}" value="${t.id}" style="width:16px;height:16px;">
        <span><strong>${t.nombre}</strong> — ${t.capacidad} personas</span>
      </label>`
    ).join('');

    const result = await Swal.fire({
      title: 'Confirmar reserva',
      html: `
        <p style="margin-bottom:12px;">Selecciona las mesas para asignar a esta reserva de <strong>${r.clienteNombre || r.clienteEmail}</strong>:</p>
        <div style="text-align:left;max-height:260px;overflow-y:auto;padding:8px;border:1px solid #eee;border-radius:8px;">
          ${tablesHtml}
        </div>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2e7d32',
      cancelButtonColor: '#6c757d',
      confirmButtonText: '✅ Confirmar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const selected = this.allTables
          .filter(t => (document.getElementById(`mesa-${t.id}`) as HTMLInputElement)?.checked)
          .map(t => t.id);
        if (selected.length === 0) {
          Swal.showValidationMessage('Debes seleccionar al menos una mesa.');
          return false;
        }
        return selected;
      }
    });

    if (result.isConfirmed && result.value) {
      const selectedIds: string[] = result.value;
      this.reservationService.confirmReservation(r.id, { mesasIds: selectedIds }).subscribe({
        next: () => {
          this.loadReservations();
          Swal.fire({ title: '¡Confirmada!', text: 'La reserva fue confirmada correctamente.', icon: 'success', confirmButtonColor: '#2e7d32' });
        },
        error: (err) => Swal.fire('Error', err?.error?.message || 'No se pudo confirmar.', 'error')
      });
    }
  }

  rechazarReserva(r: Reservation) {
    if (r.estado !== 'SOLICITADA') return;
    Swal.fire({
      title: '¿Rechazar reserva?',
      text: `Se rechazará la reserva de ${r.clienteNombre || r.clienteEmail}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#c62828',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, rechazar',
      cancelButtonText: 'No'
    }).then(result => {
      if (result.isConfirmed) {
        this.reservationService.rejectReservation(r.id).subscribe({
          next: () => {
            this.loadReservations();
            Swal.fire({ title: 'Rechazada', text: 'La reserva fue rechazada.', icon: 'info', confirmButtonColor: '#c62828' });
          },
          error: (err) => Swal.fire('Error', err?.error?.message || 'No se pudo rechazar.', 'error')
        });
      }
    });
  }

  cancelarReserva(r: Reservation) {
    if (r.estado === 'CANCELADA' || r.estado === 'FINALIZADA') return;
    Swal.fire({
      title: '¿Cancelar reserva?',
      text: `Cancelarás la reserva de ${r.clienteNombre || r.clienteEmail}. Esta acción es irreversible.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#bd1b5b',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No'
    }).then(result => {
      if (result.isConfirmed) {
        this.reservations = this.reservations.filter(res => res.id !== r.id);
        this.reservationService.cancelReservation(r.id).subscribe({
          next: () => {
            this.loadReservations();
            Swal.fire({ title: '¡Cancelada!', text: 'La reserva fue cancelada.', icon: 'success', confirmButtonColor: '#bd1b5b' });
          },
          error: (err) => {
            this.loadReservations();
            Swal.fire('Error', err?.error?.message || 'No se pudo cancelar.', 'error');
          }
        });
      }
    });
  }

  getStatusClass(estado: string): string {
    const map: Record<string, string> = {
      CONFIRMADA: 'status-confirmada',
      SOLICITADA: 'status-solicitada',
      CANCELADA: 'status-cancelada',
      RECHAZADA: 'status-rechazada',
      FINALIZADA: 'status-finalizada',
    };
    return map[estado?.toUpperCase()] ?? '';
  }

  canConfirm(r: Reservation): boolean { return r.estado === 'SOLICITADA'; }
  canReject(r: Reservation): boolean { return r.estado === 'SOLICITADA'; }
  canCancel(r: Reservation): boolean { return r.estado !== 'CANCELADA' && r.estado !== 'FINALIZADA' && r.estado !== 'RECHAZADA'; }
}

