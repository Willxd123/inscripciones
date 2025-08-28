import { EstudianteService } from './../estudiante/estudiante.service';
import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { LogingDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: EstudianteService,
    private readonly jwtService: JwtService,
  ) {}

  async login({ registro, clave }: LogingDto) {
    const estudiante = await this.usuariosService.findByRegistroWithPassword(registro);
  
    if (!estudiante) {
      throw new UnauthorizedException('Registro incorrecto');
    }
  
    if (!estudiante.clave) {
      throw new UnauthorizedException('Estudiante sin clave configurada');
    }
  
    let passwordOk = false;
  
    // Verificar si la clave está encriptada (hash de bcrypt empieza con $2a$, $2b$ o $2y$)
    if (estudiante.clave.startsWith('$2')) {
      // Clave encriptada - usar bcrypt
      passwordOk = await bcrypt.compare(clave, estudiante.clave);
    } else {
      // Clave en texto plano - comparación directa
      passwordOk = clave === estudiante.clave;
    }
  
    if (!passwordOk) {
      throw new UnauthorizedException('Clave incorrecta');
    }
  
    const payload = {
      id: estudiante.id,
      registro: estudiante.registro,
      nombre: estudiante.nombre,
    };
  
    const token = await this.jwtService.signAsync(payload);
    return { token, registro: estudiante.registro };
  }

}
