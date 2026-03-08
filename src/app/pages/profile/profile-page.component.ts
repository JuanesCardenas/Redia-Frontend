import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css',
})
export class ProfilePage implements OnInit {
  editMode = false;
  passwordMode = false;

  user = {
    nombre: '',
    email: '',
    telefono: '',
    rol: '',
    fotoUrl: ''
  };

  editUser = { ...this.user };

  ngOnInit() {
    this.user.nombre = localStorage.getItem('nombre') || '';
    this.user.email = localStorage.getItem('email') || '';
    this.user.telefono = localStorage.getItem('telefono') || '';
    this.user.rol = localStorage.getItem('role') || 'CLIENTE';
    this.user.fotoUrl = localStorage.getItem('fotoUrl') || '';
    this.editUser = { ...this.user };
  }

  passwords = { actual: '', nueva: '', confirmar: '' };

  editarDatos() {
    this.editUser = { ...this.user };
    this.editMode = true;
    this.passwordMode = false;
  }

  cancelarEdicion() {
    this.editMode = false;
  }

  guardarCambios() {
    this.user = { ...this.editUser };
    this.editMode = false;
  }

  cambiarContrasena() {
    this.passwords = { actual: '', nueva: '', confirmar: '' };
    this.passwordMode = true;
    this.editMode = false;
  }

  cancelarContrasena() {
    this.passwordMode = false;
  }

  guardarContrasena() {
    if (this.passwords.nueva !== this.passwords.confirmar) {
      alert('Las contraseñas no coinciden');
      return;
    }
    console.log('Contraseña actualizada');
    this.passwordMode = false;
  }
}
