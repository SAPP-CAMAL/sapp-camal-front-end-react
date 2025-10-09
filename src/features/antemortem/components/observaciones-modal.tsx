"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, AlertCircle, FileText, Skull, CheckCircle, XCircle, Eye, ChevronDown, ChevronUp, Tag } from "lucide-react";
import { getObservationsByStatusCorralService } from "../server/db/antemortem.service";
import { ObservationDetail } from "../domain/line.types";
import { MarcaInfo } from "../domain";

type ObservacionesModalProps = {
  observaciones: string;
  children: React.ReactNode;
  statusCorralId?: number;
  admissionDate?: string;
  marcasInfo?: MarcaInfo[];
};

export function ObservacionesModal({ 
  observaciones, 
  children, 
  statusCorralId,
  admissionDate,
  marcasInfo = []
}: ObservacionesModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [observationsData, setObservationsData] = useState<ObservationDetail[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const getMarcaName = (animalCode: string): string => {
    if (marcasInfo.length === 0) return "";
    if (marcasInfo.length === 1) {
      const match = marcasInfo[0].label.match(/^([A-Z\s\u00f1\u00d1]+)/);
      return match ? match[1].trim() : marcasInfo[0].label.split(' ')[0];
    }
    return marcasInfo.map(m => {
      const match = m.label.match(/^([A-Z\s\u00f1\u00d1]+)/);
      return match ? match[1].trim() : m.label.split(' ')[0];
    }).filter((value, index, self) => self.indexOf(value) === index).join(', ');
  };
  
  const getAllMarcasNames = (): string[] => {
    if (marcasInfo.length === 0) return [];
    return marcasInfo.map(m => {
      const match = m.label.match(/^([A-Z\s\u00f1\u00d1]+)/);
      return match ? match[1].trim() : m.label.split(' ')[0];
    }).filter((value, index, self) => self.indexOf(value) === index);
  };

  useEffect(() => {
    if (open && statusCorralId && admissionDate) {
      loadObservations();
    }
  }, [open, statusCorralId, admissionDate]);

  const loadObservations = async () => {
    if (!statusCorralId || !admissionDate) return;

    try {
      setLoading(true);
      setError(null);
      const response = await getObservationsByStatusCorralService(admissionDate, statusCorralId);
      
      if (response.code === 200) {
        const withObservations = response.data.filter(
          (obs) => obs.observationsText && obs.observationsText.trim() !== ""
        );
        setObservationsData(withObservations);
      } else {
        setError("Error al cargar las observaciones");
      }
    } catch (err) {
      console.error("Error loading observations:", err);
      setError("Error al cargar las observaciones");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (code: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(code)) {
        newSet.delete(code);
      } else {
        newSet.add(code);
      }
      return newSet;
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <Eye className="h-5 w-5 text-blue-600" />
            Observaciones Detalladas
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-2 sm:px-4 pb-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-3" />
              <p className="text-sm text-muted-foreground">Cargando observaciones...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-8 w-8 text-red-600 mb-3" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          ) : observationsData.length === 0 ? (
            <div className="bg-muted/50 rounded-lg p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground font-medium mb-1">
                No hay observaciones registradas
              </p>
              <p className="text-sm text-muted-foreground">
                Los animales en este corral no tienen observaciones detalladas
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Contador de animales */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total de animales con observaciones</p>
                      <p className="text-2xl font-bold text-blue-600">{observationsData.length}</p>
                    </div>
                  </div>
                  {getAllMarcasNames().length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <p className="text-xs text-muted-foreground w-full sm:w-auto">Marcas en este corral:</p>
                      {getAllMarcasNames().map((marca, idx) => (
                        <Badge 
                          key={idx}
                          variant="outline" 
                          className="bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-purple-300 font-semibold text-xs"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {marca}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {observationsData.map((obs, index) => {
                const isExpanded = expandedCards.has(obs.code);
                const hasDeathInfo = obs.deathCause || obs.deathUse !== undefined || obs.deathConfiscation !== undefined;
                const observationPreview = obs.observationsText && obs.observationsText.length > 100
                  ? obs.observationsText.substring(0, 100) + "..."
                  : obs.observationsText;

                return (
                  <Card 
                    key={obs.code}
                    className="overflow-hidden border-l-4 border-l-blue-500 hover:shadow-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="p-3 sm:p-4">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 font-mono text-sm px-3 py-1">
                            #{obs.code}
                          </Badge>
                          {getMarcaName(obs.code) && (
                            <Badge variant="outline" className="bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-purple-300 font-semibold text-xs px-2.5 py-1 gap-1.5">
                              <Tag className="h-3 w-3" />
                              {obs.brandName}
                            </Badge>
                          )}
                          {hasDeathInfo && (
                            <Badge variant="destructive" className="gap-1">
                              <Skull className="h-3 w-3" />
                              Muerte
                            </Badge>
                          )}
                        </div>                        
                        {(() => {
                          const hasDeathInfoContent = hasDeathInfo && 
                            (obs.deathCause || obs.deathUse !== undefined || obs.deathConfiscation !== undefined);
                          const hasOpinions = obs.opinions && obs.opinions.length > 0;
                          const hasLongText = obs.observationsText && obs.observationsText.length > 100;
                          const hasMultipleItems = [hasDeathInfoContent, hasOpinions, hasLongText].filter(Boolean).length > 1;
                          const shouldShowButton = hasMultipleItems || hasLongText;
                          
                          return shouldShowButton ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpand(obs.code)}
                              className="h-8 px-2 flex-shrink-0"
                              title={isExpanded ? "Mostrar menos" : "Mostrar más"}
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          ) : null;
                        })()}
                      </div>

                      {/* Observaciones */}
                      {obs.observationsText && (
                        <div className="mb-3">
                          <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            Observaciones
                          </p>
                          <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {isExpanded ? obs.observationsText : observationPreview}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Opiniones/Dictámenes */}
                      {obs.opinions && obs.opinions.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Dictamen
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {obs.opinions.map((opinion, idx) => (
                              <Badge 
                                key={idx}
                                variant="secondary"
                                className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs px-2 py-1"
                              >
                                {opinion}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Información de muerte (solo si está expandido y hay datos de muerte) */}
                      {isExpanded && hasDeathInfo && (obs.deathCause || obs.deathUse !== undefined || obs.deathConfiscation !== undefined) && (
                        <>
                          <Separator className="my-3" />
                          <div className="bg-red-50 border border-red-200 rounded-md p-3 space-y-2">
                            <p className="text-xs font-semibold text-red-700 uppercase flex items-center gap-1 mb-2">
                              <Skull className="h-3 w-3" />
                              Información de Muerte
                            </p>
                            
                            {obs.deathCause && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                  <p className="text-xs text-muted-foreground mb-0.5">Causa de muerte</p>
                                  <p className="text-sm font-medium text-red-900">{obs.deathCause}</p>
                                </div>
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-2 mt-2">
                              {obs.deathUse !== undefined && (
                                <div className="flex items-center gap-2 bg-white rounded px-2 py-1.5">
                                  {obs.deathUse ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-gray-400" />
                                  )}
                                  <span className="text-xs">Aprovechamiento</span>
                                </div>
                              )}
                              {obs.deathConfiscation !== undefined && (
                                <div className="flex items-center gap-2 bg-white rounded px-2 py-1.5">
                                  {obs.deathConfiscation ? (
                                    <CheckCircle className="h-4 w-4 text-red-600" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-gray-400" />
                                  )}
                                  <span className="text-xs">Decomiso</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

