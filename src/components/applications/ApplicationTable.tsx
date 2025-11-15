import { Link } from 'react-router-dom'
import { Application } from '@/types/application'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface ApplicationTableProps {
  applications: Application[]
}

export function ApplicationTable({ applications }: ApplicationTableProps) {
  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Tags</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((app) => (
            <TableRow key={app.id}>
              <TableCell className="font-medium">
                <Link to={`/applications/${app.id}`} className="hover:underline text-primary">
                  {app.name}
                </Link>
              </TableCell>
              <TableCell>{app.department}</TableCell>
              <TableCell>{app.owner.team}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {app.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {app.tags.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{app.tags.length - 2}
                    </Badge>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
