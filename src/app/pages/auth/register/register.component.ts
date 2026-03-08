import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterLink } from '@angular/router'
import { Router } from '@angular/router'
import { AuthService } from '../../../core/services/auth.service'
import { AlertService } from '../../../core/services/alert.service'
import { NavbarComponent } from '../../../shared/navbar/navbar.component'
import { FooterComponent } from '../../../shared/footer/footer.component'

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, NavbarComponent, FooterComponent],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent {

    nombre = ''
    email = ''
    telefono = ''
    password = ''
    confirmPassword = ''
    showPassword = false
    showConfirmPassword = false
    passwordError = ''
    role = 'CLIENTE'
    foto?: File

    constructor(
        private authService: AuthService,
        private router: Router,
        private alertService: AlertService
    ) { }

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }

    toggleConfirmPasswordVisibility() {
        this.showConfirmPassword = !this.showConfirmPassword;
    }

    onFileSelected(event: any) {
        this.foto = event.target.files[0]
    }

    register() {
        this.passwordError = '';

        if (this.password !== this.confirmPassword) {
            this.passwordError = 'Las contraseñas no coinciden.';
            return;
        }

        const data = {
            nombre: this.nombre,
            email: this.email,
            telefono: this.telefono,
            password: this.password,
            role: this.role,
            fotoUrl: this.foto
        }

        this.authService.register(data).subscribe({

            next: () => {
                this.alertService.success('¡Usuario registrado exitosamente!')
                this.router.navigate(['/login'])
            },

            error: err => {
                console.error('Registration Error:', err)
                if (err.name === 'HttpErrorResponse' && err.status === 0) {
                    this.alertService.error('Error de red. Asegúrate de que el servidor (Redia-Backend) esté encendido.')
                } else {
                    this.alertService.error('Hubo un error al registrar el usuario.')
                }
            }

        })

    }

}