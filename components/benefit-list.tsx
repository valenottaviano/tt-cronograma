import { Benefit } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Info } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface BenefitListProps {
  benefits: Benefit[];
}

export function BenefitList({ benefits }: BenefitListProps) {
  if (benefits.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No hay beneficios disponibles por el momento.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {benefits.map((benefit) => (
        <Card
          key={benefit.id}
          className="flex flex-col h-full overflow-hidden hover:border-primary/50 transition-colors pt-0"
        >
          {benefit.logo && (
            <div className="relative h-48 w-full bg-white p-4 flex items-center justify-center">
              <div className="relative w-full h-full">
                <Image
                  src={benefit.logo}
                  alt={benefit.company}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}
          <CardHeader>
            <CardTitle>{benefit.title}</CardTitle>
            <p className="text-sm text-muted-foreground font-medium">
              {benefit.company}
            </p>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            <p className="text-muted-foreground flex-1">
              {benefit.description}
            </p>

            {benefit.linkCta && (() => {
              const isUrl = benefit.linkCta.startsWith('http') || benefit.linkCta.startsWith('/') || benefit.linkCta.startsWith('www');
              
              if (isUrl) {
                const href = benefit.linkCta.startsWith('www') ? `https://${benefit.linkCta}` : benefit.linkCta;
                return (
                  <Button asChild variant="outline" className="w-full mt-auto">
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Aprovechar beneficio <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                );
              }

              return (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full mt-auto">
                      Más información  <Info className="ml-2 h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>{benefit.title}</DialogTitle>
                      <p className="text-sm text-muted-foreground font-medium">
                        {benefit.company}
                      </p>
                    </DialogHeader>
                    <div className="flex flex-col gap-3 py-4">
                      {benefit.linkCta.split('\n').filter(line => line.trim() !== '').map((paragraph, index) => (
                        <p key={index} className="text-sm leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              );
            })()}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
