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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {benefits.map((benefit) => (
        <Card
          key={benefit.id}
          className="flex flex-row md:flex-col h-full overflow-hidden hover:border-primary/50 transition-colors pt-0 group"
        >
          {benefit.logo && (
            <div className="relative w-28 h-auto md:h-48 md:w-full p-2 md:p-4 flex-shrink-0 flex items-center justify-center border-r md:border-r-0 md:border-b transition-colors">
              <div className="relative w-full h-full aspect-square">
                <Image
                  src={benefit.logo}
                  alt={benefit.company}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}
          <div className="flex flex-col flex-1 min-w-0">
            <CardHeader className="p-4 pb-1 md:p-6 md:pb-2">
              <CardTitle className="text-base md:text-xl line-clamp-1 md:line-clamp-none">
                {benefit.title}
              </CardTitle>
              <p className="text-xs md:text-sm text-muted-foreground font-medium">
                {benefit.company}
              </p>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-3 p-4 pt-1 md:p-6 md:pt-0">
              <p className="text-xs md:text-sm text-muted-foreground flex-1">
                {benefit.description}
              </p>

              {benefit.linkCta && (() => {
                const isUrl = benefit.linkCta.startsWith('http') || benefit.linkCta.startsWith('/') || benefit.linkCta.startsWith('www');
                
                if (isUrl) {
                  const href = benefit.linkCta.startsWith('www') ? `https://${benefit.linkCta}` : benefit.linkCta;
                  return (
                    <Button asChild variant="outline" size="sm" className="w-full mt-2 text-xs md:text-sm md:h-10">
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Aprovechar <ExternalLink className="ml-2 h-3 w-3 md:h-4 md:w-4" />
                      </a>
                    </Button>
                  );
                }

                return (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full mt-2 text-xs md:text-sm md:h-10">
                        Info <Info className="ml-2 h-3 w-3 md:h-4 md:w-4" />
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
          </div>
        </Card>
      ))}
    </div>
  );
}
