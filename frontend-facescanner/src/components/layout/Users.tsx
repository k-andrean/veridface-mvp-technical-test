import { Badge } from '../ui/badge';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '../ui/DropdownMenu';
import { MoreHorizontal } from 'lucide-react';
import { TableCell, TableRow } from '../ui/Table';
import { UserRowProps } from '../../types/user';

export function UserRow({ user }: UserRowProps) {

  console.log('user id', user.id);
  
  const navigate = useNavigate();

  const handleEditClick = () => {
    navigate(`/users/${user.id}`);
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{user.name}</TableCell>
      <TableCell className="hidden md:table-cell">{user.email}</TableCell>
      <TableCell className="hidden md:table-cell">{user.phoneNumber}</TableCell>
      <TableCell className="hidden md:table-cell">{user.digitalID}</TableCell>
      <TableCell className="hidden md:table-cell">
        {user.time.toLocaleString("en-US")}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-haspopup="true" size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='z-[9999] bg-gray-100' align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem className='cursor-pointer hover:bg-gray-100 hover:text-blue-600' onClick={handleEditClick}>
              Edit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}