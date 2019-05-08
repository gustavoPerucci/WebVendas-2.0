# VC++ 6.0 Makefile for SQLite3 ODBC driver                  -*- Makefile -*-
#
#

ROOT    = .
SRCDIR  = $(ROOT)

!ifndef DEBUG
DEBUG = 0
!endif DEBUG
!ifndef PROFILE
PROFILE = 0
!endif
!ifndef SYMBOLS
SYMBOLS = 0
!endif

!if $(DEBUG)
OUTDIR =Debug
CFLAGS =-Od -Zi -GZ -MDd -D_DEBUG
LDFLAGS=-debug:full -debugtype:cv
!else
OUTDIR =Release
!if $(SYMBOLS)
CFLAGS =-Od -Zi -Op -Gs -MD -DNDEBUG=1
LDFLAGS=-debug -opt:ref -opt:icf,3
!else
CFLAGS =-O2 -Op -Gs -MD -DNDEBUG=1
LDFLAGS=-release -opt:ref -opt:icf,3
!endif
!endif

!if $(PROFILE)
CFLAGS =$(CFLAGS) -Zi
LDFLAGS=$(LDFLAGS) -profile -map
!endif

TMPDIR =$(OUTDIR)\OdbcObjects

LIBSQLITE=$(OUTDIR)\libsqlite3.lib

CC     =cl -nologo
LD     =link -nologo
AR     =lib -nologo
RC     =rc
AWK    =awk
COPY   =copy
RMDIR  =rmdir /s /q

CFLAGS =$(CFLAGS) -W3 -GX -YX -Fp$(TMPDIR)^\
INC    =-I$(SRCDIR) -I$(OUTDIR) -I$(TMPDIR)
DEFS   =-D_WIN32 -DOS_WIN=1 -D_DLL -DHAVE_SQLITEATOF=1
LIBS   =odbccp32.lib comdlg32.lib user32.lib

#-------------------------------------------------------------------------

OBJECTS =$(TMPDIR)\sqlite3odbc.obj

all: setup $(OUTDIR)\sqlite3odbc.dll $(OUTDIR)\inst.exe \
	$(OUTDIR)\uninst.exe $(OUTDIR)\adddsn.exe \
	$(OUTDIR)\remdsn.exe $(OUTDIR)\addsysdsn.exe $(OUTDIR)\remsysdsn.exe

$(OUTDIR)\sqlite3odbc.dll: $(LIBSQLITE) $(OBJECTS) $(TMPDIR)\sqlite3odbc.res
	$(LD) -dll -out:$@ $(LDFLAGS) $(OBJECTS) $(TMPDIR)\sqlite3odbc.res \
	-def:$(SRCDIR)\sqlite3odbc.def $(LIBSQLITE) $(LIBS)

$(OUTDIR)\inst.exe: $(SRCDIR)\inst.c
	$(CC) $(CFLAGS) -o $@ -Fo$(TMPDIR)\ inst.c $(LIBS)

$(OUTDIR)\adddsn.exe: $(SRCDIR)\adddsn.c
	$(CC) $(CFLAGS) -o $@ -Fo$(TMPDIR)\ adddsn.c $(LIBS)

$(OUTDIR)\uninst.exe: $(OUTDIR)\inst.exe
	@$(COPY) $** $@ >NUL

$(OUTDIR)\remdsn.exe: $(OUTDIR)\adddsn.exe
	@$(COPY) $** $@ >NUL

$(OUTDIR)\remsysdsn.exe: $(OUTDIR)\adddsn.exe
	@$(COPY) $** $@ >NUL

$(OUTDIR)\addsysdsn.exe: $(OUTDIR)\adddsn.exe
	@$(COPY) $** $@ >NUL

$(SRCDIR)\sqlite3odbc.c: $(TMPDIR)\resource.h

$(TMPDIR)\sqlite3odbc.res: $(SRCDIR)\sqlite3odbc.rc $(TMPDIR)\resource.h
	$(RC) -I. -I$(OUTDIR) -I$(TMPDIR) -fo $@ -r $(SRCDIR)\sqlite3odbc.rc

$(TMPDIR)\VERSION_C: $(SRCDIR)\VERSION $(TMPDIR)\fixup.exe
	$(TMPDIR)\fixup < $(SRCDIR)\VERSION > $@ . ,

$(TMPDIR)\resource.h: $(SRCDIR)\resource.h.in $(TMPDIR)\VERSION_C
	$(TMPDIR)\fixup < $(SRCDIR)\resource.h.in > $@ \
	    --VERS-- @$(SRCDIR)\VERSION \
	    --VERS_C-- @$(TMPDIR)\VERSION_C

$(LIBSQLITE): $(SRCDIR)\sqlite3.mak
	@nmake -nologo -f $(SRCDIR)\sqlite3.mak

#-------------------------------------------------------------------------

$(TMPDIR)\fixup.exe: $(SRCDIR)\fixup.c
	$(CC) $(CFLAG) -o $@ -Fo$(TMPDIR)\ $**

$(TMPDIR)\mkopc.exe: $(SRCDIR)\mkopc.c
	$(CC) $(CFLAGS) -o $@ -Fo$(TMPDIR)\ $**

#-------------------------------------------------------------------------

.SUFFIXES: .c

{$(SRCDIR)}.c{$(TMPDIR)}.obj::
        $(CC) $(CFLAGS) $(INC) $(DEFS) -Fo$(TMPDIR)\ -c @<<
$<
<<

#-------------------------------------------------------------------------

setup:
        @if not exist $(OUTDIR) mkdir $(OUTDIR)
        @if not exist $(TMPDIR) mkdir $(TMPDIR)

clean:
	@nmake -nologo -f $(SRCDIR)\sqlite3.mak clean
	@if exist $(TMPDIR) $(RMDIR) $(TMPDIR) >NUL

realclean:
	@if exist $(OUTDIR) $(RMDIR) $(OUTDIR) >NUL

DISTDIR=$(OUTDIR)\sqlite-3.5.7-odbc-0.65
dist: all
	@if not exist $(DISTDIR) mkdir $(DISTDIR)
	@if not exist $(DISTDIR)\src mkdir $(DISTDIR)\src
	@copy $(OUTDIR)\inst.exe $(DISTDIR)
	@copy $(OUTDIR)\uninst.exe $(DISTDIR)
	@copy $(OUTDIR)\sqlite3odbc.dll $(DISTDIR)
	@copy $(SRCDIR)\license.terms $(DISTDIR)
	@copy $(SRCDIR)\README $(DISTDIR)
	@copy $(SRCDIR)\mkopcodec.awk $(DISTDIR)\src
	@copy $(SRCDIR)\sqlite3.mak $(DISTDIR)\src
	@copy $(SRCDIR)\sqlite3odbc.mak $(DISTDIR)\src
	@type << > $(DISTDIR)\README.SRC
Provided is the SQLite ODBC driver 0.65 linked to SQLite version 3.3.5.
To build this yourself, obtain the sqliteodbc source code from
http://www.ch-werner.de/sqliteodbc/ and unpack it. Then obtain the sqlite
sources or check out the cvs repository as a subdirectory called sqlite3.
Then copy the files files from the src/ subdirectory in this archive
into the sqliteodbc directory, replacing any already present.
You will need to get a Win32 version of awk (GNU awk can be obtained easily).

Now you can use MSVC++ 6.0 to build everything using
 nmake -f sqlite3odbc.mak

All the release executables will end up in Release.

Pat Thoyts <patthoyts@users.sourceforge.net>
<<
