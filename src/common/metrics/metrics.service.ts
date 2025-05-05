import { Injectable } from '@nestjs/common';
import { Counter, register } from 'prom-client';

@Injectable()
export class MetricsService {
  [x: string]: any;
  private receitasCriadasCounter: Counter<string>;
  private receitasFalhaCriacaoCounter: Counter<string>;
  private usuariosCriadosCounter: Counter<string>;

  constructor() {
    // Contador de receitas criadas
    if (!register.getSingleMetric('receitas_criadas_total')) {
      this.receitasCriadasCounter = new Counter({
        name: 'receitas_criadas_total',
        help: 'Número total de receitas criadas',
      });
      register.registerMetric(this.receitasCriadasCounter);
    } else {
      this.receitasCriadasCounter = register.getSingleMetric('receitas_criadas_total') as Counter<string>;
    }

    // Contador de falhas na criação de receitas
    if (!register.getSingleMetric('receitas_criacao_falha_total')) {
      this.receitasFalhaCriacaoCounter = new Counter({
        name: 'receitas_criacao_falha_total',
        help: 'Número total de falhas ao criar receitas',
      });
      register.registerMetric(this.receitasFalhaCriacaoCounter);
    } else {
      this.receitasFalhaCriacaoCounter = register.getSingleMetric('receitas_criacao_falha_total') as Counter<string>;
    }

    // Contador de usuários criados
    if (!register.getSingleMetric('usuarios_criados_total')) {
      this.usuariosCriadosCounter = new Counter({
        name: 'usuarios_criados_total',
        help: 'Número total de usuários criados',
      });
      register.registerMetric(this.usuariosCriadosCounter);
    } else {
      this.usuariosCriadosCounter = register.getSingleMetric('usuarios_criados_total') as Counter<string>;
    }
  }

  incrementarReceitasCriadas() {
    this.receitasCriadasCounter.inc();
  }

  incrementarFalhasReceita() {
    this.receitasFalhaCriacaoCounter.inc();
  }

  incrementarUsuariosCriados() {
    this.usuariosCriadosCounter.inc();
  }
}
