import {
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  Table,
} from '../ui/Table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '../ui/Card';
import { UserRow } from './Users'; // Make sure this path is correct
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { UsersTableProps } from '../../types/user';


export function UsersTable({
  users,
  offset,
  totalUsers,
  productsPerPage,
  onPrev,
  onNext
}: UsersTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='mb-4 text-red-400'>Users Table</CardTitle>
        <CardDescription>
          Manage your users and their event history.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">Phone Number</TableHead>
              <TableHead className="hidden md:table-cell">Digital ID</TableHead>
              <TableHead className="hidden md:table-cell">Time</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <UserRow key={user.id} user={user} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <form className="flex items-center w-full justify-between">
          <div className="text-xs text-muted-foreground">
            Showing{' '}
            <strong>
              {Math.max(1, offset - productsPerPage + 1)}–{Math.min(offset, totalUsers)}
            </strong>{' '}
            of <strong>{totalUsers}</strong> users
          </div>
          <div className="flex">
            <Button
              onClick={onPrev}
              variant="ghost"
              size="sm"
              type="button"
              disabled={offset <= productsPerPage}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Prev
            </Button>
            <Button
              onClick={onNext}
              variant="ghost"
              size="sm"
              type="button"
              disabled={offset >= totalUsers}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  );
}
