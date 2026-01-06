import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            ← Volver al inicio
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">
              Términos y Condiciones de Uso
            </CardTitle>
            <CardDescription className="text-base">
              Sistema de Automatización de Procesos Productivos (SAPP) - Gestión de Camales
            </CardDescription>
            <p className="text-sm text-muted-foreground mt-2">
              Última actualización: Enero 2026
            </p>
          </CardHeader>
          <CardContent className="space-y-6 text-sm">
            {/* 1. Aceptación de los Términos */}
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Aceptación de los Términos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Al acceder y utilizar el Sistema de Automatización de Procesos Productivos (SAPP) para la gestión de operaciones en camales y centros de faenamiento, usted acepta estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar este sistema.
              </p>
            </section>

            {/* 2. Descripción del Servicio */}
            <section>
              <h2 className="text-xl font-semibold mb-3">2. Descripción del Servicio</h2>
              <p className="text-muted-foreground leading-relaxed mb-2">
                SAPP es un sistema integral diseñado para la gestión y control de procesos en establecimientos de faenamiento de animales (camales), incluyendo pero no limitado a:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Registro y control de ingreso de animales</li>
                <li>Gestión de procesos antemortem y postmortem</li>
                <li>Control de higiene y limpieza</li>
                <li>Fiscalización y trazabilidad</li>
                <li>Generación de certificados y reportes</li>
                <li>Control de pesaje y distribución</li>
                <li>Gestión de corrales y áreas de faenamiento</li>
              </ul>
            </section>

            {/* 3. Uso Autorizado */}
            <section>
              <h2 className="text-xl font-semibold mb-3">3. Uso Autorizado</h2>
              <p className="text-muted-foreground leading-relaxed mb-2">
                El acceso al sistema está restringido a personal autorizado de establecimientos de faenamiento legalmente constituidos. Los usuarios se comprometen a:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Utilizar el sistema únicamente para fines profesionales relacionados con la operación del camal</li>
                <li>Mantener la confidencialidad de sus credenciales de acceso</li>
                <li>No compartir su cuenta con terceros no autorizados</li>
                <li>Registrar información veraz y actualizada</li>
                <li>Cumplir con todas las normativas sanitarias y legales aplicables</li>
              </ul>
            </section>

            {/* 4. Responsabilidades del Usuario */}
            <section>
              <h2 className="text-xl font-semibold mb-3">4. Responsabilidades del Usuario</h2>
              <p className="text-muted-foreground leading-relaxed">
                Los usuarios son responsables de la exactitud y veracidad de toda la información ingresada en el sistema. Esto incluye datos de animales, condiciones de transporte, resultados de inspecciones sanitarias, registros de pesaje, y cualquier otra información crítica para la trazabilidad y seguridad alimentaria. El uso inadecuado del sistema o el ingreso de información falsa puede resultar en la suspensión del acceso y acciones legales correspondientes.
              </p>
            </section>

            {/* 5. Protección de Datos */}
            <section>
              <h2 className="text-xl font-semibold mb-3">5. Protección de Datos</h2>
              <p className="text-muted-foreground leading-relaxed">
                SAPP recopila y procesa datos relacionados con las operaciones del camal, incluyendo información de animales, transportistas, destinatarios, y procesos productivos. Toda la información es tratada de forma confidencial y se almacena de manera segura conforme a las leyes de protección de datos vigentes en Ecuador. Los datos son utilizados exclusivamente para fines de gestión operativa, trazabilidad, reportes regulatorios y mejora del servicio.
              </p>
            </section>

            {/* 6. Cumplimiento Normativo */}
            <section>
              <h2 className="text-xl font-semibold mb-3">6. Cumplimiento Normativo</h2>
              <p className="text-muted-foreground leading-relaxed">
                El sistema está diseñado para facilitar el cumplimiento de las normativas sanitarias ecuatorianas para establecimientos de faenamiento, incluyendo regulaciones de AGROCALIDAD y autoridades de salud pública. Sin embargo, es responsabilidad del establecimiento y sus operadores garantizar el cumplimiento total de todas las normativas aplicables. SAPP es una herramienta de apoyo y no exime al usuario de sus obligaciones legales.
              </p>
            </section>

            {/* 7. Trazabilidad y Registros */}
            <section>
              <h2 className="text-xl font-semibold mb-3">7. Trazabilidad y Registros</h2>
              <p className="text-muted-foreground leading-relaxed">
                El sistema mantiene un registro completo de todas las operaciones realizadas, incluyendo marcas de tiempo, usuario responsable y detalles de cada transacción. Estos registros son inmutables y pueden ser utilizados para auditorías internas, inspecciones regulatorias y propósitos de trazabilidad sanitaria. Los datos históricos se conservan según los plazos establecidos por la normativa vigente.
              </p>
            </section>

            {/* 8. Disponibilidad del Sistema */}
            <section>
              <h2 className="text-xl font-semibold mb-3">8. Disponibilidad del Sistema</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nos esforzamos por mantener el sistema disponible de forma continua, sin embargo, no garantizamos disponibilidad ininterrumpida. El sistema puede experimentar períodos de mantenimiento programado o interrupciones por causas de fuerza mayor. Se notificará con anticipación sobre mantenimientos programados cuando sea posible.
              </p>
            </section>

            {/* 9. Limitación de Responsabilidad */}
            <section>
              <h2 className="text-xl font-semibold mb-3">9. Limitación de Responsabilidad</h2>
              <p className="text-muted-foreground leading-relaxed">
                ENCUBA y SAPP no serán responsables por daños directos, indirectos, incidentales o consecuentes derivados del uso o imposibilidad de uso del sistema, incluyendo pero no limitado a pérdida de datos, interrupción del negocio o pérdidas económicas. El usuario acepta que utiliza el sistema bajo su propio riesgo y responsabilidad.
              </p>
            </section>

            {/* 10. Propiedad Intelectual */}
            <section>
              <h2 className="text-xl font-semibold mb-3">10. Propiedad Intelectual</h2>
              <p className="text-muted-foreground leading-relaxed">
                Todo el contenido, diseño, código fuente, documentación y funcionalidades del sistema SAPP son propiedad de ENCUBA y están protegidos por las leyes de propiedad intelectual. Queda prohibida la reproducción, distribución, modificación o uso no autorizado del sistema o cualquiera de sus componentes.
              </p>
            </section>

            {/* 11. Modificaciones */}
            <section>
              <h2 className="text-xl font-semibold mb-3">11. Modificaciones a los Términos</h2>
              <p className="text-muted-foreground leading-relaxed">
                ENCUBA se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en el sistema. Es responsabilidad del usuario revisar periódicamente estos términos. El uso continuado del sistema después de la publicación de cambios constituye la aceptación de los mismos.
              </p>
            </section>

            {/* 12. Suspensión y Terminación */}
            <section>
              <h2 className="text-xl font-semibold mb-3">12. Suspensión y Terminación</h2>
              <p className="text-muted-foreground leading-relaxed">
                ENCUBA se reserva el derecho de suspender o terminar el acceso de cualquier usuario que viole estos Términos y Condiciones, sin previo aviso y sin responsabilidad alguna. La terminación del acceso no exime al usuario de las obligaciones contraídas durante el período de uso del sistema.
              </p>
            </section>

            {/* 13. Jurisdicción */}
            <section>
              <h2 className="text-xl font-semibold mb-3">13. Ley Aplicable y Jurisdicción</h2>
              <p className="text-muted-foreground leading-relaxed">
                Estos Términos y Condiciones se rigen por las leyes de la República del Ecuador. Cualquier controversia derivada de estos términos será sometida a los tribunales competentes de Ecuador, renunciando las partes a cualquier otro fuero que pudiera corresponderles.
              </p>
            </section>

            {/* 14. Contacto */}
            <section>
              <h2 className="text-xl font-semibold mb-3">14. Contacto</h2>
              <p className="text-muted-foreground leading-relaxed">
                Para consultas sobre estos Términos y Condiciones, puede contactar a ENCUBA a través de los canales oficiales de comunicación del establecimiento o visitando{" "}
                <Link
                  href="https://encuba.ec"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  encuba.ec
                </Link>
                .
              </p>
            </section>

            {/* Disclaimer final */}
            <section className="pt-6 border-t">
              <p className="text-xs text-muted-foreground italic">
                Al utilizar el Sistema de Automatización de Procesos Productivos (SAPP), usted reconoce haber leído, comprendido y aceptado estos Términos y Condiciones en su totalidad.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
