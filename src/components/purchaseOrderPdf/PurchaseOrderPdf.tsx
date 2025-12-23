import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import NayashLogo from "../../assets/images/Nayash Logo.png";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "white",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  companyLeft: {
    width: "60%",
  },

  logo: {
    width: 150,
    height: 50,
    marginBottom: 5,
  },

  companyName: {
    fontSize: 12,
    paddingBottom: 4,
    fontWeight: "bold",
  },

  titleRight: {
    width: "40%",
    alignItems: "flex-end",
  },

  poTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },

  box: {
    width: "50%",
    padding: 8,
    marginBottom: 10,
  },

  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },

  paragraph: {
    marginBottom: 10,
  },

  table: {
    border: "1px solid #000",
  },

  tableRow: {
    flexDirection: "row",
  },

  tableHeader: {
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
  },

  cell: {
    borderRight: "1px solid #000",
    padding: 4,
  },

  footer: {
    marginTop: 30,
  },
  address: {
    marginBottom: 4,
  },
  gstn: {
    marginBottom: 2,
  },
});

interface selectedPOType {
  po_number: string;
  po_date: string;
  vendor_name: string;
  vendor_address: string;
  vendor_gstn: string;
  vendor_phone: string;
  po_items: [];
  po_terms_and_conditions: string[];
}

const PurchaseOrderPDF = ({ selectedPO }: { selectedPO: selectedPOType }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.companyLeft}>
          <Image src={NayashLogo} style={styles.logo} />
        </View>

        <View style={styles.titleRight}>
          <Text style={styles.poTitle}>PURCHASE ORDER</Text>
          <Text>PO No: {selectedPO.po_number ?? ""}</Text>
          <Text>Date: {selectedPO.po_date ?? ""}</Text>
        </View>
      </View>

      {/* BUYER and VENDOR DETAILS */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <View style={styles.box}>
          <Text style={styles.sectionTitle}>Buyer Details</Text>
          <Text style={styles.companyName}>Nayash Group</Text>
          <Text style={styles.address}>
            First Floor,Tamara Uprise,Rahatani Road, Pune, 411017
          </Text>
          <Text style={styles.gstn}>GST: 27XXXXX1234Z1</Text>
          <Text>Phone: 9876543210</Text>
        </View>
        <View style={styles.box}>
          <Text style={styles.sectionTitle}>Vendor Details</Text>
          <Text style={styles.companyName}>{selectedPO.vendor_name ?? ""}</Text>
          <Text style={styles.address}>{selectedPO.vendor_address ?? ""}</Text>
          <Text style={styles.gstn}>GST: {selectedPO.vendor_gstn ?? ""}</Text>
          <Text>Phone: {selectedPO.vendor_phone ?? ""}</Text>
        </View>
      </View>

      {/* SUBJECT */}
      <Text style={styles.sectionTitle}>
        Subject: Purchase Order for Construction Materials
      </Text>

      {/* PARAGRAPH */}
      <Text style={styles.paragraph}>
        We are pleased to place this Purchase Order for supply of the materials
        mentioned below. Kindly ensure timely delivery at site as per agreed
        terms and conditions.
      </Text>

      {/* ITEMS TABLE */}
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.cell, { width: "5%" }]}>#</Text>
          <Text style={[styles.cell, { width: "10%" }]}>Name</Text>
          <Text style={[styles.cell, { width: "35%" }]}>Description</Text>
          <Text style={[styles.cell, { width: "10%" }]}>Unit</Text>
          <Text style={[styles.cell, { width: "10%" }]}>Qty</Text>
          <Text style={[styles.cell, { width: "15%" }]}>Rate</Text>
          <Text style={{ width: "15%", padding: 4 }}>Amount</Text>
        </View>

        {selectedPO.po_items.map((item: any, i: number) => (
          <View style={styles.tableRow} key={i}>
            <Text style={[styles.cell, { width: "5%" }]}>{i + 1}</Text>
            <Text style={[styles.cell, { width: "10%" }]}>
              {item.item_name ?? ""}
            </Text>
            <Text style={[styles.cell, { width: "35%" }]}>
              {item.description}
            </Text>
            <Text style={[styles.cell, { width: "10%" }]}>
              {item.unit ?? ""}
            </Text>
            <Text style={[styles.cell, { width: "10%" }]}>
              {item.quantity ?? ""}
            </Text>
            <Text style={[styles.cell, { width: "15%" }]}>
              {item.rate ?? ""}
            </Text>
            <Text style={{ width: "15%", padding: 4 }}>
              {item.amount ?? ""}
            </Text>
          </View>
        ))}
      </View>

      {/* TERMS */}
      <View style={styles.box}>
        <Text style={styles.sectionTitle}>Terms & Conditions</Text>
        {selectedPO.po_terms_and_conditions.map((t: string, i: number) => (
          <Text key={i}>
            {i + 1}. {t}
          </Text>
        ))}
      </View>

      {/* SIGNATURE */}
      <View style={styles.footer}>
        <Text>For Nayash Group</Text>
        <Text style={{ marginTop: 40 }}>Authorized Signatory</Text>
      </View>
    </Page>
  </Document>
);
export default PurchaseOrderPDF;
