import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Hand, Check, Loader2 } from "lucide-react";
import { ObservacionesModal } from "./observaciones-modal";
import { MarcaInfo } from "../domain";
import { QuantitySelector } from "@/components/quantity-selector";

type AntemortemMobileCardProps = {
  item: {
    corral: string;
    marcas: string[];
    marcasInfo?: MarcaInfo[];
    observaciones?: string;
    argollas?: number;
    machos: number;
    hembras: number;
    total: number;
    statusCorralId?: number;
    haveObservations?: boolean;
  };
  showArgollas: boolean;
  onViewSignosClinicas: (marca: string, settingId: number) => void;
  editingArgollasCorral?: string | null;
  tempArgollasValue?: number;
  savingArgollasCorral?: string | null;
  onArgollasClick?: (corral: string, currentValue: number) => void;
  onArgollasChange?: (value: number) => void;
  onSaveArgollas?: () => void;
  onCancelArgollas?: () => void;
  admissionDate?: string;
};

export function AntemortemMobileCard({ 
  item, 
  showArgollas, 
  onViewSignosClinicas,
  editingArgollasCorral,
  tempArgollasValue = 0,
  savingArgollasCorral,
  onArgollasClick,
  onArgollasChange,
  onSaveArgollas,
  onCancelArgollas,
  admissionDate
}: AntemortemMobileCardProps) {
  // Función para extraer conteos H y M de una marca
  const extractHMCounts = (m: string) => {
    const hMatch = m.match(/H\s*[:=]\s*(\d+)|(\d+)\s*H/i);
    const mMatch = m.match(/M\s*[:=]\s*(\d+)|(\d+)\s*M/i);
    const h = hMatch ? parseInt(hMatch[1] || hMatch[2]) : 0;
    const mm = mMatch ? parseInt(mMatch[1] || mMatch[2]) : 0;
    return { h, m: mm };
  };

  // Renderizado de marcas: colorea H (azul) y M (rosa) 
  const renderMarcaPieces = (m: string) => {
    const nodes: React.ReactNode[] = [];
    const re = /(H\s*[:=]\s*(\d+))|(\b(\d+)\s*H\b)|(M\s*[:=]\s*(\d+))|(\b(\d+)\s*M\b)/gi;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = re.exec(m)) !== null) {
      const start = match.index;
      if (start > lastIndex) {
        nodes.push(
          <span key={`t-${lastIndex}`} className="text-black">
            {m.slice(lastIndex, start)}
          </span>
        );
      }
      let isH = false;
      let num = "";
      if (match[1]) {
        isH = true;
        num = match[2] ?? "";
      } else if (match[3]) {
        isH = true;
        num = match[4] ?? "";
      } else if (match[5]) {
        isH = false;
        num = match[6] ?? "";
      } else if (match[7]) {
        isH = false;
        num = match[8] ?? "";
      }
      nodes.push(
        <span key={`k-${start}`} className={isH ? "text-blue-600 font-medium" : "text-rose-600 font-medium"}>
          {num} {isH ? "H" : "M"}
        </span>
      );
      lastIndex = re.lastIndex;
    }
    if (lastIndex < m.length) {
      nodes.push(
        <span key={`t-${lastIndex}`} className="text-black">
          {m.slice(lastIndex)}
        </span>
      );
    }
    return nodes;
  };

  return (
    <Card className="mb-3 overflow-hidden">
      <CardHeader className="pb-2 pt-3 px-4 bg-muted/20">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Corral: {item.corral}</span>
          <span className="font-bold text-emerald-600">{item.total} total</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Marcas */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <Hand className="h-4 w-4" />
              Marcas (toca para ver signos):
            </h4>
            <div className="flex flex-wrap gap-2">
              {(item.marcasInfo || item.marcas.map((m, i) => ({ label: m, settingCertificateBrandsId: 0 }))).map((marcaInfo, i) => {
                const { h, m } = extractHMCounts(marcaInfo.label);
                const totalAnimales = h + m;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      if (marcaInfo.settingCertificateBrandsId > 0) {
                        onViewSignosClinicas(marcaInfo.label, marcaInfo.settingCertificateBrandsId);
                      }
                    }}
                    className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                  >
                    <Badge 
                      variant="outline" 
                      className={`text-sm cursor-pointer transition-colors ${
                        marcaInfo.settingCertificateBrandsId > 0 
                          ? 'hover:bg-primary hover:text-primary-foreground bg-muted' 
                          : 'opacity-60'
                      }`}
                    >
                      <span className="inline-flex items-center gap-1">
                        {renderMarcaPieces(marcaInfo.label)}
                      </span>
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contadores */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center bg-blue-50 rounded-md p-2">
              <div className="text-sm text-muted-foreground">Machos</div>
              <div className="text-blue-600 font-bold">{item.machos}</div>
            </div>
            <div className="text-center bg-rose-50 rounded-md p-2">
              <div className="text-sm text-muted-foreground">Hembras</div>
              <div className="text-rose-600 font-bold">{item.hembras}</div>
            </div>
            {showArgollas && (
              <div className="text-center bg-amber-50 rounded-md p-2">
                <div className="text-sm text-muted-foreground mb-1">Argollas</div>
                {editingArgollasCorral === item.corral ? (
                  <div className="space-y-2">
                    <QuantitySelector
                      quantity={tempArgollasValue}
                      onQuantityChanged={(val) => onArgollasChange?.(val)}
                      title=""
                      className="min-w-0 w-full"
                    />
                    <div className="flex gap-1 justify-center">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={onCancelArgollas}
                        className="h-7 px-2 text-xs hover:bg-gray-100"
                        disabled={savingArgollasCorral === item.corral}
                      >
                        ✕
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={onSaveArgollas}
                        disabled={savingArgollasCorral === item.corral}
                        className="h-7 px-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        {savingArgollasCorral === item.corral ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => onArgollasClick?.(item.corral, item.argollas || 0)}
                    className="text-amber-600 font-bold hover:text-amber-700 hover:underline w-full"
                  >
                    {item.argollas || 0}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Observaciones */}
          {item.haveObservations && (
            <div>
              <ObservacionesModal 
                observaciones={item.observaciones || "Sin observaciones"}
                statusCorralId={item.statusCorralId}
                admissionDate={admissionDate}
                marcasInfo={item.marcasInfo}
              >
                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver observaciones
                </Button>
              </ObservacionesModal>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
