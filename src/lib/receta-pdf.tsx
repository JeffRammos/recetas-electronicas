import { Document, Page, View, Text, Image, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { get } from "@vercel/blob";

type ItemPdf = {
  nombreSnapshot: string;
  dosis: string | null;
  frecuencia: string | null;
  cantidad: string | null;
  viaAdministracion: string | null;
};

export type DatosReceta = {
  numero: number;
  tipo: "MEDICAMENTO" | "ESTUDIO";
  fechaEmision: Date;
  fechaVencimiento: Date;
  diagnostico: string | null;
  indicaciones: string | null;
  profesional: { nombre: string; matricula: string | null; especialidad: string | null };
  paciente: {
    nombre: string;
    apellido: string;
    dni: string;
    fechaNacimiento: Date;
    sexo: string;
    obraSocialNombre: string | null;
    obraSocialCredencial: string | null;
  };
  items: ItemPdf[];
};

type FirmaEmbebida = { data: Buffer; format: "png" | "jpg" } | null;

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: "Helvetica" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  titulo: { fontSize: 16, fontFamily: "Helvetica-Bold" },
  seccion: { marginBottom: 12 },
  seccionTitulo: { fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  fila: { flexDirection: "row", marginBottom: 2 },
  etiqueta: { width: 110, color: "#555" },
  tablaHeader: { flexDirection: "row", borderBottom: 1, borderColor: "#333", paddingBottom: 4, marginBottom: 4 },
  tablaFila: { flexDirection: "row", paddingVertical: 3, borderBottom: 1, borderColor: "#ddd" },
  colNombre: { width: "30%" },
  colDosis: { width: "17.5%" },
  colFrecuencia: { width: "17.5%" },
  colCantidad: { width: "17.5%" },
  colVia: { width: "17.5%" },
  firmaBox: { marginTop: 32, alignItems: "center" },
  firmaImg: { width: 140, height: 60, objectFit: "contain" },
  firmaLinea: { borderTop: 1, borderColor: "#333", width: 200, marginTop: 4, paddingTop: 2, textAlign: "center" },
});

function formatearFecha(fecha: Date) {
  return fecha.toLocaleDateString("es-AR");
}

function calcularEdad(fechaNacimiento: Date) {
  const hoy = new Date();
  let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
  const cumplioMesEsteAnio =
    hoy.getMonth() > fechaNacimiento.getMonth() ||
    (hoy.getMonth() === fechaNacimiento.getMonth() && hoy.getDate() >= fechaNacimiento.getDate());
  if (!cumplioMesEsteAnio) edad--;
  return edad;
}

function RecetaDocument({ datos, firma }: { datos: DatosReceta; firma: FirmaEmbebida }) {
  const mostrarColumnasMedicamento = datos.tipo === "MEDICAMENTO";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.titulo}>Receta Electrónica</Text>
          <Text>N° {datos.numero}</Text>
        </View>

        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Profesional</Text>
          <View style={styles.fila}>
            <Text style={styles.etiqueta}>Nombre</Text>
            <Text>{datos.profesional.nombre}</Text>
          </View>
          <View style={styles.fila}>
            <Text style={styles.etiqueta}>Matrícula</Text>
            <Text>{datos.profesional.matricula ?? "—"}</Text>
          </View>
          <View style={styles.fila}>
            <Text style={styles.etiqueta}>Especialidad</Text>
            <Text>{datos.profesional.especialidad ?? "—"}</Text>
          </View>
        </View>

        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Paciente</Text>
          <View style={styles.fila}>
            <Text style={styles.etiqueta}>Nombre</Text>
            <Text>
              {datos.paciente.nombre} {datos.paciente.apellido}
            </Text>
          </View>
          <View style={styles.fila}>
            <Text style={styles.etiqueta}>DNI</Text>
            <Text>{datos.paciente.dni}</Text>
          </View>
          <View style={styles.fila}>
            <Text style={styles.etiqueta}>Edad / Sexo</Text>
            <Text>
              {calcularEdad(datos.paciente.fechaNacimiento)} años · {datos.paciente.sexo}
            </Text>
          </View>
          <View style={styles.fila}>
            <Text style={styles.etiqueta}>Obra social</Text>
            <Text>
              {datos.paciente.obraSocialNombre
                ? `${datos.paciente.obraSocialNombre}${
                    datos.paciente.obraSocialCredencial ? ` · Cred. ${datos.paciente.obraSocialCredencial}` : ""
                  }`
                : "Particular"}
            </Text>
          </View>
        </View>

        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>
            {datos.tipo === "MEDICAMENTO" ? "Medicamentos prescriptos" : "Estudio solicitado"}
          </Text>
          <View style={styles.tablaHeader}>
            <Text style={styles.colNombre}>Nombre</Text>
            {mostrarColumnasMedicamento && (
              <>
                <Text style={styles.colDosis}>Dosis</Text>
                <Text style={styles.colFrecuencia}>Frecuencia</Text>
                <Text style={styles.colCantidad}>Cantidad</Text>
                <Text style={styles.colVia}>Vía</Text>
              </>
            )}
          </View>
          {datos.items.map((item, i) => (
            <View key={i} style={styles.tablaFila}>
              <Text style={styles.colNombre}>{item.nombreSnapshot}</Text>
              {mostrarColumnasMedicamento && (
                <>
                  <Text style={styles.colDosis}>{item.dosis ?? "—"}</Text>
                  <Text style={styles.colFrecuencia}>{item.frecuencia ?? "—"}</Text>
                  <Text style={styles.colCantidad}>{item.cantidad ?? "—"}</Text>
                  <Text style={styles.colVia}>{item.viaAdministracion ?? "—"}</Text>
                </>
              )}
            </View>
          ))}
        </View>

        {(datos.diagnostico || datos.indicaciones) && (
          <View style={styles.seccion}>
            {datos.diagnostico && (
              <View style={styles.fila}>
                <Text style={styles.etiqueta}>Diagnóstico</Text>
                <Text>{datos.diagnostico}</Text>
              </View>
            )}
            {datos.indicaciones && (
              <View style={styles.fila}>
                <Text style={styles.etiqueta}>Indicaciones</Text>
                <Text>{datos.indicaciones}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.seccion}>
          <View style={styles.fila}>
            <Text style={styles.etiqueta}>Fecha de emisión</Text>
            <Text>{formatearFecha(datos.fechaEmision)}</Text>
          </View>
          <View style={styles.fila}>
            <Text style={styles.etiqueta}>Vence el</Text>
            <Text>{formatearFecha(datos.fechaVencimiento)}</Text>
          </View>
        </View>

        <View style={styles.firmaBox}>
          {firma && <Image src={firma} style={styles.firmaImg} />}
          <Text style={styles.firmaLinea}>
            {datos.profesional.nombre}
            {datos.profesional.matricula ? ` · Mat. ${datos.profesional.matricula}` : ""}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

async function obtenerFirmaEmbebida(firmaPath: string | null): Promise<FirmaEmbebida> {
  if (!firmaPath) return null;

  const resultado = await get(firmaPath, { access: "private" });
  if (!resultado || resultado.statusCode !== 200) return null;

  const formato =
    resultado.blob.contentType === "image/png"
      ? "png"
      : resultado.blob.contentType === "image/jpeg"
        ? "jpg"
        : null;
  if (!formato) return null; // webp u otro formato no soportado por el PDF

  const arrayBuffer = await new Response(resultado.stream).arrayBuffer();
  return { data: Buffer.from(arrayBuffer), format: formato };
}

export async function generarRecetaPdf(datos: DatosReceta, firmaPath: string | null): Promise<Buffer> {
  const firma = await obtenerFirmaEmbebida(firmaPath);
  return renderToBuffer(<RecetaDocument datos={datos} firma={firma} />);
}
