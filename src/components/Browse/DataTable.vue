<template>
  <div>
    <el-table :data="data" style="width: 100%">
      <el-table-column prop="InstitutionCode" label="Institution Code" />
      <el-table-column prop="CollectionCode" label="Collection Code" />
      <el-table-column prop="CatalogNumber" label="Catalog Number" />
      <el-table-column prop="IndividualCount" label="Individual Count" />
      <el-table-column prop="ScientificName" label="Scientific Name" />
      <el-table-column prop="Family" label="Family" />
      <el-table-column prop="PreparationType" label="Preparation Type" />
      <el-table-column prop="Tissues" label="Tissues" />
      <el-table-column prop="Latitude" label="Latitude" />
      <el-table-column prop="Longitude" label="Longitude" />
      <el-table-column prop="CoordinateUncertaintyInMeters" label="Coordinate Uncertainty (m)" />
      <el-table-column prop="HorizontalDatum" label="Horizontal Datum" />
      <el-table-column prop="Country" label="Country" />
      <el-table-column prop="StateProvince" label="State/Province" />
      <el-table-column prop="County" label="County" />
      <el-table-column prop="Island" label="Island" />
      <el-table-column prop="IslandGroup" label="Island Group" />
      <el-table-column prop="Locality" label="Locality" />
      <el-table-column prop="VerbatimElevation" label="Verbatim Elevation" />
      <el-table-column prop="VerbatimDepth" label="Verbatim Depth" />
      <el-table-column prop="YearCollected" label="Year Collected" />
      <el-table-column prop="MonthCollected" label="Month Collected" />
      <el-table-column prop="DayCollected" label="Day Collected" />
      <el-table-column prop="Collector" label="Collector" />
      <el-table-column prop="GeorefMethod" label="Georef Method" />
      <el-table-column prop="LatLongComments" label="Lat/Long Comments" />
      <el-table-column prop="BasisOfRecord" label="Basis of Record" />
      <el-table-column prop="Remarks" label="Remarks" />
      <el-table-column prop="DateLastModified" label="Date Last Modified" />
    </el-table>
  </div>
</template>

<script>
export default {
  props: {
    data: Array // 表格数据
  }
};
</script>
