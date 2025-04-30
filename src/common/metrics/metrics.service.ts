import { Injectable } from '@nestjs/common';
import { Counter, register } from 'prom-client';

@Injectable()
export class MetricsService {
  private clientesCriadosCounter: Counter<string>;

  constructor() {
    if (!register.getSingleMetric('clientes_criados_total')) {
        this.clientesCriadosCounter = new Counter({
          name: 'clientes_criados_total',
          help: 'Número total de clientes criados',
        });

        register.registerMetric(this.clientesCriadosCounter); // Registra a métrica no Prometheus
    } else {
      this.clientesCriadosCounter = register.getSingleMetric('clientes_criados_total') as Counter<string>;
    }
  }

  incrementarClientesCriados() {
    this.clientesCriadosCounter.inc();
  }
}
