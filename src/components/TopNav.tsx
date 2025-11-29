import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { PawPrint, Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { DEMO_USER_ID, MOCK_USERS } from '@shared/mock-data';
import { ThemeToggle } from './ThemeToggle';
const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/search', label: 'Search' },
  { href: '/bookings', label: 'My Bookings' },
  { href: '/messages', label: 'Messages' },
  { href: '/dashboard', label: 'Dashboard' },
];
export function TopNav() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');
  const user = MOCK_USERS.find(u => u.id === DEMO_USER_ID);
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?location=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Desktop Nav */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 text-dogroom-primary">
              <PawPrint className="w-8 h-8" />
              <span className="font-bold font-display text-xl">DogRoom</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <NavLink
                  key={link.href}
                  to={link.href}
                  className={({ isActive }) =>
                    cn(
                      'text-sm font-medium transition-colors hover:text-dogroom-primary',
                      isActive ? 'text-dogroom-primary' : 'text-muted-foreground'
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
          {/* Search and User Actions */}
          <div className="flex items-center gap-4">
            <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center relative">
              <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search locations..."
                className="pl-9 w-40 md:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Logout</DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="p-2">
                    <ThemeToggle className="relative !top-0 !right-0" />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Mobile Nav Trigger */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <nav className="flex flex-col gap-6 text-lg font-medium mt-8">
                    {navLinks.map((link) => (
                      <SheetClose asChild key={link.href}>
                        <NavLink
                          to={link.href}
                          className={({ isActive }) =>
                            cn(
                              'transition-colors hover:text-dogroom-primary',
                              isActive ? 'text-dogroom-primary' : 'text-foreground'
                            )
                          }
                        >
                          {link.label}
                        </NavLink>
                      </SheetClose>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}