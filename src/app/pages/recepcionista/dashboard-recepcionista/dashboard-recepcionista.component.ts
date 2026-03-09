import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { FooterComponent } from '../../../shared/footer/footer.component';
import { ReservationService } from '../../../core/services/reservation.service';

@Component({
  selector: 'app-dashboard-recepcionista',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DatePipe, NavbarComponent, FooterComponent],
  templateUrl: './dashboard-recepcionista.component.html',
  styleUrl: './dashboard-recepcionista.component.css',
})
export class DashboardRecepcionista implements OnInit {
  today = new Date();
  isLoading = true;

  mesas: { id: string; nombre: string; capacidad: number }[] = [];
  reservasHoy: any[] = [];

  get reservasTotal() { return this.reservasHoy.length; }
  get reservasConfirmadas() { return this.reservasHoy.filter(r => r.estado?.toUpperCase() === 'CONFIRMADA').length; }
  get reservasSolicitadas() { return this.reservasHoy.filter(r => r.estado?.toUpperCase() === 'SOLICITADA').length; }
  get totalMesas() { return this.mesas.length; }

  constructor(
    private reservationService: ReservationService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;

    // Load tables
    this.reservationService.getTablesForReservations().subscribe({
      next: (tables) => {
        const sortedTables = (tables as any[]).sort((a, b) => a.nombre.localeCompare(b.nombre));
        this.mesas = sortedTables;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando mesas:', err)
    });

    // Load today's reservations
    this.reservationService.getAllReservations().subscribe({
      next: (reservations) => {
        const todayStr = this.today.toISOString().split('T')[0];
        this.reservasHoy = reservations.filter(r => {
          const fechaStr = typeof r.fechaReserva === 'string'
            ? r.fechaReserva.split('T')[0]
            : '';
          return fechaStr === todayStr;
        }).map(r => ({
          id: r.id,
          clienteEmail: r.clienteEmail || '—',
          clienteNombre: r.clienteNombre || '',
          horaEntrada: typeof r.fechaReserva === 'string' ? r.fechaReserva.substring(11, 16) : '—',
          horaSalida: typeof r.horaFinReserva === 'string' ? r.horaFinReserva.substring(11, 16) : '—',
          personas: r.numeroPersonas,
          estado: r.estado,
        }));
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando reservas:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getStatusClass(estado: string): string {
    if (!estado) return '';
    const map: Record<string, string> = {
      CONFIRMADA: 'status-confirmada',
      SOLICITADA: 'status-solicitada',
      CANCELADA: 'status-cancelada',
      RECHAZADA: 'status-rechazada',
      FINALIZADA: 'status-finalizada',
    };
    return map[estado?.toUpperCase()] ?? '';
  }
}
