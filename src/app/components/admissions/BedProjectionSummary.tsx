import { Fragment } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  formatOccupancy,
  type BedProjections,
  type CapacityTotals,
  type ProjectionMonth,
} from "../../lib/projectionsWaitlist";

// Six-month summary (US 17573): open beds per Program for every month at
// once, with campus subtotals, Agency Total and Projected Occupancy — read
// from the same buildBedProjections() result as the grid below.

function TotalsRow({
  label,
  values,
}: {
  label: string;
  values: (string | number)[];
}) {
  return (
    <TableRow
      hoverable={false}
      className="bg-[var(--slds-g-color-background-alt)]"
    >
      <TableCell className="slds-text-3 font-semibold">
        {label}
      </TableCell>
      {values.map((v, i) => (
        <TableCell
          key={i}
          className="text-center slds-text-3 font-semibold"
        >
          {v}
        </TableCell>
      ))}
    </TableRow>
  );
}

const occupancy = (t: CapacityTotals) =>
  t.capacity.map((cap, i) =>
    formatOccupancy(t.occupied[i], cap),
  );

export function BedProjectionSummary({
  data,
  months,
}: {
  data: BedProjections;
  months: ProjectionMonth[];
}) {
  return (
    <div className="space-y-2">
      <h3 className="slds-text-4 font-semibold">
        Six-Month Open Beds Summary
      </h3>
      <Table>
        <TableHeader>
          <TableRow hoverable={false}>
            <TableHead variant="slds">Program</TableHead>
            {months.map((m) => (
              <TableHead
                key={m.key}
                variant="slds"
                className="text-center"
              >
                {m.longLabel}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.campuses.map((c) => (
            <Fragment key={c.campus}>
              <TableRow hoverable={false}>
                <TableCell
                  colSpan={months.length + 1}
                  className="slds-text-3 font-semibold uppercase tracking-wide"
                >
                  {c.campus} Campus
                </TableCell>
              </TableRow>
              {c.homes.map((h) => (
                <TableRow key={h.home.id}>
                  <TableCell className="pl-6 slds-text-3">
                    {h.home.name}
                  </TableCell>
                  {h.open.map((v, i) => (
                    <TableCell
                      key={i}
                      className="text-center slds-text-3"
                    >
                      {v}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              <TotalsRow
                label={`${c.campus} Campus Subtotal`}
                values={c.open}
              />
              <TotalsRow
                label={`${c.campus} Projected Occupancy`}
                values={occupancy(c)}
              />
            </Fragment>
          ))}
          <TotalsRow
            label="Agency Total"
            values={data.agency.open}
          />
          <TotalsRow
            label="Projected Occupancy"
            values={occupancy(data.agency)}
          />
        </TableBody>
      </Table>
    </div>
  );
}